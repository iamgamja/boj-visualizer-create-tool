import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import Line from "./Line";
import Select from "./Select";
import SelectColor from "./SelectColor";
import Warning from "./Warning";

type InputType_line = { type: "line"; vars: string[] };

const color = {
  "bg-green-200": "text-black",
  "bg-red-300": "text-black",
  "bg-gray-500": "text-black",
  "bg-gray-800": "text-white",
} as const;
type color = typeof color;

function is_bg_color(s: string): s is keyof color {
  return Object.keys(color).includes(s);
}

const text_options = {
  "항상 같은 문자": "() => '#'",
  "cell의 값 사용": "({cell}) => cell.value['#']",
  "board의 값 사용": "({board}) => board.value['#']",
} as const;
type text_options = typeof text_options;

function is_text_option(s: string): s is keyof text_options {
  return Object.keys(text_options).includes(s);
}

type textobj =
  | {
      name: "항상 같은 문자";
      detail: [string];
    }
  | {
      name: "cell의 값 사용";
      detail: [string];
    }
  | {
      name: "board의 값 사용";
      detail: [string];
    };

type styletype = {
  backgroundColor: keyof color;
  textColor: color[keyof color];
  text: textobj;
};

const rule_options = {
  "항상 거짓인 조건": "() => false",
  "항상 참인 조건": "() => true",
  "특정 문자": "({s}) => s === '#'",
  "특정 좌표 (변수 or 상수) (0-index)":
    "({y, x}) => {const tmp_1 = '#'; const tmp_2 = '#'; return y === +(vars[tmp_1] ?? tmp_1) - (+#) && x === +(vars[tmp_2] ?? tmp_2) - (+#)}",
} as const;
type rule_options = typeof rule_options;

function is_rule_option(s: string): s is keyof rule_options {
  return Object.keys(rule_options).includes(s);
}

type ruleobj =
  | {
      name: "항상 거짓인 조건" | "항상 참인 조건";
      detail: [];
    }
  | {
      name: "특정 문자";
      detail: [string];
    }
  | {
      name: "특정 좌표 (변수 or 상수) (0-index)";
      detail: [y: string, x: string, y_m1: string, x_m1: string]; // *_m1: *에 -1을 해야 한다면 1, 아니면 0
    };

const default_options = {
  "특정 값(문자열)": "() => '#'",
  "특정 값(수)": "() => #",
  "입력값 사용(문자열)": "({s}) => s",
  "입력값 사용(수)": "({s}) => +s",
} as const;
type default_options = typeof default_options;

function is_default_option(s: string): s is keyof default_options {
  return Object.keys(default_options).includes(s);
}

type valuetype =
  | {
      name: "특정 값(문자열)";
      detail: [string];
    }
  | {
      name: "특정 값(수)";
      detail: [string];
    }
  | {
      name: "입력값 사용(문자열)";
      detail: [];
    }
  | {
      name: "입력값 사용(수)";
      detail: [];
    };

type cellType = {
  name: string;
  rule: ruleobj;
  style: styletype;
  value: {
    name: string;
    type: valuetype;
  }[];
};

type InputType_board = {
  type: "board";
  N: string;
  N_m1: string;
  M: string;
  M_m1: string;
  space: boolean;
  cellTypes: cellType[];
};

type InputType = InputType_line | InputType_board;

export default function SetParseBoard({
  next,
}: {
  next: (data: string) => void;
}) {
  const [inputs, setInputs] = useState<InputType[]>([]);

  function makecode(): string {
    const board = inputs.find((x) => x.type === "board")! as InputType_board;

    return `
      export const style: styletype = {
        ${board.cellTypes
          .map((celltype) => {
            let func: string = text_options[celltype.style.text.name];
            while (celltype.style.text.detail.length > 0)
              func = func.replace("#", celltype.style.text.detail.shift()!);
            return `
              "${celltype.name}": {
                backgroundColor: "${celltype.style.backgroundColor}",
                textColor: "${celltype.style.textColor}",
                text: (${func}),
              },
            `;
          })
          .join("\n")}
      };

      export function parseBoard(s: string): Board {
        const lines = s.split("\\n");
        const board_tmp: string[][] = [];
        const vars: Record<string, string> = {};

        let tmp_line: string[];

        ${inputs
          .map((it) => {
            if (it.type === "line") {
              return `
                if (lines.length === 0) throw new Error("잘못된 입력");
                tmp_line = lines.shift()!.split(" ");
                ${it.vars
                  .map((v) => {
                    return `
                      if (tmp_line.length === 0) throw new Error("잘못된 입력");
                      vars["${v}"] = tmp_line.shift()!;
                    `;
                  })
                  .join("\n")}
                if (tmp_line.length !== 0) throw new Error("잘못된 입력");
              `;
            } else {
              return `
                const N = +(vars["${board.N}"] ?? "${board.N}") - (+${
                board.N_m1
              });
                const M = +(vars["${board.M}"] ?? "${board.M}") - (+${
                board.M_m1
              });

                const board = new Board(N, M);

                for (let y=0; y<N; y++) {
                  if (lines.length === 0) throw new Error("잘못된 입력");
                  ${
                    board.space
                      ? 'tmp_line = lines.shift()!.split(" ");'
                      : "tmp_line = [...lines.shift()!];"
                  }
                  board_tmp.push([]);
                  for (let x=0; x<M; x++) {
                    if (tmp_line.length === 0) throw new Error("잘못된 입력");
                    board_tmp.at(-1)!.push(tmp_line.shift()!);
                  }
                  if (tmp_line.length !== 0) throw new Error("잘못된 입력");
                }
              `;
            }
          })
          .join("\n")}

        if (lines.length !== 0) throw new Error("잘못된 입력");

        for (let y=0; y<N; y++) {
          for (let x=0; x<M; x++) {
            ${board.cellTypes
              .map((celltype, idx) => {
                let func: string = rule_options[celltype.rule.name];
                while (celltype.rule.detail.length > 0)
                  func = func.replace("#", celltype.rule.detail.shift()!);
                return `
                  ${
                    idx === 0 ? "" : "else"
                  } if (((${func}) as ({board, s, y, x}: {board: Board, s: string, y: number, x: number}) => boolean)({board, s, y, x})) {
                    ${
                      celltype.name === "Player"
                        ? `
                          board.grid[y][x] = new Cell(
                            "Empty",
                            {
                              value: {
                                ${celltype.value
                                  .map(({ name, type }) => {
                                    let func: string =
                                      default_options[type.name];
                                    while (type.detail.length > 0)
                                      func = func.replace(
                                        "#",
                                        type.detail.shift()!
                                      );
                                    return `
                                      "${name}": ((${func}) as ({board, s, y, x}: {board: Board, s: string, y: number, x: number}) => any)({board, s, y, x}),
                                    `;
                                  })
                                  .join(" ")}
                              }
                            }
                          );
                          board.player = {y, x};
                        `
                        : `
                          board.grid[y][x] = new Cell(
                            "${celltype.name}",
                            {
                              value: {
                                ${celltype.value
                                  .map(({ name, type }) => {
                                    let func: string =
                                      default_options[type.name];
                                    while (type.detail.length > 0)
                                      func = func.replace(
                                        "#",
                                        type.detail.shift()!
                                      );
                                    return `
                                      "${name}": ((${func}) as ({board, s, y, x}: {board: Board, s: string, y: number, x: number}) => any)({board, s, y, x}),
                                    `;
                                  })
                                  .join(" ")}
                              }
                            }
                          );
                        `
                    }
                  }
                `;
              })
              .join(" ")}
            else {
              throw new Error("잘못된 입력");
            }
          }
        }

        return board;
      }
    `.trim();
  }

  return (
    <>
      <div className="flex flex-col gap-2 p-5 m-5 bg-gray-200 font-mono">
        <p>입력을 파싱하는 함수를 만듭니다.</p>
        <Warning>board는 정확히 한 번 입력받아야 합니다.</Warning>
        <Line highlighted />
        {inputs.map((t, idx) => (
          <div className="flex flex-col gap-2" key={idx}>
            {t.type === "line" && (
              <>
                <p>이 줄에서 {t.vars.length}개의 변수를 입력받습니다.</p>
                {t.vars.map((_, idx_line) => (
                  <Input
                    label={`${idx_line + 1}번째 변수`}
                    value={t.vars[idx_line]}
                    onChange={(s) => {
                      setInputs((prev) => {
                        const now = [...prev];
                        t.vars[idx_line] = s;
                        return now;
                      });
                    }}
                    key={idx_line}
                  />
                ))}
                <Button
                  onClick={() => {
                    setInputs((prev) => {
                      const now = [...prev];
                      t.vars.push("");
                      return now;
                    });
                  }}
                >
                  변수 추가
                </Button>
                <Line highlighted />
              </>
            )}

            {t.type === "board" && (
              <>
                <p>
                  이 줄부터 {t.N}개의 줄에서 board를 입력받습니다. 각 줄은 {t.M}
                  개의 칸을 {t.space ? "공백으로 구분하여" : "공백 없이"}{" "}
                  나타내는 문자열입니다.
                </p>
                <Warning>
                  기본적으로 변수를 모두 입력받은 뒤 board를 parsing하기 때문에
                  board의 입력 과정에서 변수를 사용할 수 있습니다. 그러나 다음
                  두 입력은 board의 크기를 나타내기 때문에, 변수를 사용한다면
                  board보다 먼저 입력받아야 합니다.
                </Warning>
                <p>
                  <Input
                    label="N (변수 or 상수)"
                    value={t.N}
                    onChange={(s) => {
                      setInputs((prev) => {
                        const now = [...prev];
                        t.N = s;
                        return now;
                      });
                    }}
                  />
                  <Input
                    type="checkbox"
                    label="-1"
                    value={t.N_m1}
                    onChange={(s) => {
                      setInputs((prev) => {
                        const now = [...prev];
                        t.N_m1 = s;
                        return now;
                      });
                    }}
                  />
                </p>
                <p>
                  <Input
                    label="M (변수 or 상수)"
                    value={t.M}
                    onChange={(s) => {
                      setInputs((prev) => {
                        const now = [...prev];
                        t.M = s;
                        return now;
                      });
                    }}
                  />
                  <Input
                    type="checkbox"
                    label="-1"
                    value={t.M_m1}
                    onChange={(s) => {
                      setInputs((prev) => {
                        const now = [...prev];
                        t.M_m1 = s;
                        return now;
                      });
                    }}
                  />
                </p>
                <Line highlighted />
                <p>
                  parsing 과정에서 각 칸을 다음과 같이 name으로 구분합니다.
                  name은 시뮬레이션 중 변경될 수 있습니다.
                </p>
                <Warning>
                  예외적으로 name=Player인 칸은 정확히 한 칸만 존재해야 하며, 그
                  칸은 name=Empty로 처리됩니다.
                </Warning>
                <Line highlighted />
                {t.cellTypes.map((celltype, idx_board) => (
                  <div className="flex flex-col gap-2" key={idx_board}>
                    <p>
                      {idx_board !== 0 && "아니고"} 만약 {celltype.rule.name}{" "}
                      {celltype.rule.name ===
                        "특정 좌표 (변수 or 상수) (0-index)" &&
                        `(${celltype.rule.detail[0]}, ${celltype.rule.detail[1]})`}
                      {celltype.rule.name === "특정 문자" &&
                        `(${celltype.rule.detail[0]})`}{" "}
                      (이)라면 {celltype.name}입니다.
                    </p>
                    <Input
                      label="name"
                      value={celltype.name}
                      onChange={(s) => {
                        setInputs((prev) => {
                          const now = [...prev];
                          celltype.name = s;
                          return now;
                        });
                      }}
                      key={idx_board}
                    />
                    <Select
                      label="조건"
                      options={Object.keys(rule_options)}
                      value={t.cellTypes[idx_board].rule.name}
                      onChange={(v) => {
                        if (!is_rule_option(v)) throw new Error("unreachable");
                        setInputs((prev) => {
                          const now = [...prev];
                          if (v === "특정 문자")
                            t.cellTypes[idx_board] = {
                              name: t.cellTypes[idx_board].name,
                              rule: {
                                name: v,
                                detail: [""],
                              },
                              style: {
                                backgroundColor: "bg-green-200",
                                textColor: "text-black",
                                text: {
                                  name: "항상 같은 문자",
                                  detail: [""],
                                },
                              },
                              value: [],
                            };
                          else if (v === "특정 좌표 (변수 or 상수) (0-index)")
                            t.cellTypes[idx_board] = {
                              name: t.cellTypes[idx_board].name,
                              rule: {
                                name: v,
                                detail: ["0", "0", "0", "0"],
                              },
                              style: {
                                backgroundColor: "bg-green-200",
                                textColor: "text-black",
                                text: {
                                  name: "항상 같은 문자",
                                  detail: [""],
                                },
                              },
                              value: [],
                            };
                          else
                            t.cellTypes[idx_board] = {
                              name: t.cellTypes[idx_board].name,
                              rule: {
                                name: v,
                                detail: [],
                              },
                              style: {
                                backgroundColor: "bg-green-200",
                                textColor: "text-black",
                                text: {
                                  name: "항상 같은 문자",
                                  detail: [""],
                                },
                              },
                              value: [],
                            };
                          return now;
                        });
                      }}
                    />
                    {celltype.rule.name ===
                      "특정 좌표 (변수 or 상수) (0-index)" && (
                      <>
                        <p>
                          <Input
                            label="y"
                            value={celltype.rule.detail[0].toString()}
                            onChange={(s) => {
                              setInputs((prev) => {
                                const now = [...prev];
                                celltype.rule.detail[0] = s;
                                return now;
                              });
                            }}
                            key={"y"}
                          />
                          <Input
                            type="checkbox"
                            label="-1"
                            value={celltype.rule.detail[2]}
                            onChange={(s) => {
                              setInputs((prev) => {
                                const now = [...prev];
                                celltype.rule.detail[2] = s;
                                return now;
                              });
                            }}
                          />
                        </p>
                        <p>
                          <Input
                            label="x"
                            value={celltype.rule.detail[1].toString()}
                            onChange={(s) => {
                              setInputs((prev) => {
                                const now = [...prev];
                                celltype.rule.detail[1] = s;
                                return now;
                              });
                            }}
                            key={"x"}
                          />
                          <Input
                            type="checkbox"
                            label="-1"
                            value={celltype.rule.detail[3]}
                            onChange={(s) => {
                              setInputs((prev) => {
                                const now = [...prev];
                                celltype.rule.detail[3] = s;
                                return now;
                              });
                            }}
                          />
                        </p>
                      </>
                    )}
                    {celltype.rule.name === "특정 문자" && (
                      <>
                        <Input
                          label="문자"
                          value={celltype.rule.detail[0]}
                          onChange={(s) => {
                            setInputs((prev) => {
                              const now = [...prev];
                              celltype.rule.detail = [s];
                              return now;
                            });
                          }}
                          key={idx_board}
                        />
                      </>
                    )}
                    <Line />
                    <p>이 칸은 다음과 같이 보입니다.</p>
                    <div
                      className={`inline-flex items-center justify-center size-10 border-[1px] border-black relative ${celltype.style.backgroundColor} ${celltype.style.textColor}`}
                    >
                      {(celltype.style.text.name === "cell의 값 사용" ||
                        celltype.style.text.name === "board의 값 사용") &&
                        "{"}
                      {celltype.style.text.detail[0]}
                      {(celltype.style.text.name === "cell의 값 사용" ||
                        celltype.style.text.name === "board의 값 사용") &&
                        "}"}
                    </div>
                    <SelectColor
                      label="색"
                      options={Object.keys(color)}
                      colorobj={color}
                      value={celltype.style.backgroundColor}
                      onChange={(s) => {
                        if (!is_bg_color(s)) throw new Error("unreachable");
                        setInputs((prev) => {
                          const now = [...prev];
                          celltype.style.backgroundColor = s;
                          celltype.style.textColor = color[s];
                          return now;
                        });
                      }}
                    />
                    <Select
                      label="text"
                      options={Object.keys(text_options)}
                      value={celltype.style.text.name}
                      onChange={(s) => {
                        if (!is_text_option(s)) throw new Error("unreachable");
                        setInputs((prev) => {
                          const now = [...prev];
                          celltype.style.text = {
                            name: s,
                            detail: [""],
                          };
                          return now;
                        });
                      }}
                    />
                    {celltype.style.text.name === "항상 같은 문자" && (
                      <Input
                        label="문자"
                        value={celltype.style.text.detail[0]}
                        onChange={(s) => {
                          setInputs((prev) => {
                            const now = [...prev];
                            celltype.style.text.detail[0] = s;
                            return now;
                          });
                        }}
                      />
                    )}
                    {celltype.style.text.name === "cell의 값 사용" && (
                      <Input
                        label="변수"
                        value={celltype.style.text.detail[0]}
                        onChange={(s) => {
                          setInputs((prev) => {
                            const now = [...prev];
                            celltype.style.text.detail[0] = s;
                            return now;
                          });
                        }}
                      />
                    )}
                    {celltype.style.text.name === "board의 값 사용" && (
                      <Input
                        label="변수"
                        value={celltype.style.text.detail[0]}
                        onChange={(s) => {
                          setInputs((prev) => {
                            const now = [...prev];
                            celltype.style.text.detail[0] = s;
                            return now;
                          });
                        }}
                      />
                    )}
                    <Line />
                    <p>
                      이 칸은 다음 {celltype.value.length}개의 값을 가집니다.
                    </p>
                    {celltype.value.map((v, idx_var) => {
                      const v_type = v.type;
                      return (
                        <div className="flex flex-col gap-2" key={idx_var}>
                          <p>{idx_var + 1}번째 값:</p>
                          <Input
                            label="이름"
                            value={v.name}
                            onChange={(s) => {
                              setInputs((prev) => {
                                const now = [...prev];
                                celltype.value[idx_var].name = s;
                                return now;
                              });
                            }}
                            key={idx_var}
                          />
                          <Select
                            label="기본값"
                            options={Object.keys(default_options)}
                            value={v_type.name}
                            onChange={(s) => {
                              if (!is_default_option(s))
                                throw new Error("unreachable");
                              setInputs((prev) => {
                                const now = [...prev];
                                if (s === "특정 값(문자열)")
                                  v.type = {
                                    name: s,
                                    detail: [""],
                                  };
                                else if (s === "특정 값(수)")
                                  v.type = {
                                    name: s,
                                    detail: ["0"],
                                  };
                                else
                                  v.type = {
                                    name: s,
                                    detail: [],
                                  };
                                return now;
                              });
                            }}
                          />
                          {v_type.name === "특정 값(문자열)" && (
                            <Input
                              label="값"
                              value={v_type.detail[0]}
                              onChange={(s) => {
                                setInputs((prev) => {
                                  const now = [...prev];
                                  v_type.detail[0] = s;
                                  return now;
                                });
                              }}
                            />
                          )}
                          {v_type.name === "특정 값(수)" && (
                            <Input
                              type={"number"}
                              label="값"
                              value={v_type.detail[0].toString()}
                              onChange={(s) => {
                                setInputs((prev) => {
                                  const now = [...prev];
                                  v_type.detail[0] = s;
                                  return now;
                                });
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                    <Button
                      onClick={() => {
                        setInputs((prev) => {
                          const now = [...prev];
                          celltype.value.push({
                            name: "",
                            type: {
                              name: "입력값 사용(문자열)",
                              detail: [],
                            },
                          });
                          return now;
                        });
                      }}
                    >
                      값 추가
                    </Button>
                    <Line highlighted />
                  </div>
                ))}
                <p>아니라면 올바르지 않은 입력입니다.</p>
                <Button
                  onClick={() => {
                    setInputs((prev) => {
                      const now = [...prev];
                      t.cellTypes.push({
                        name: "",
                        rule: {
                          name: "항상 거짓인 조건",
                          detail: [],
                        },
                        style: {
                          backgroundColor: "bg-green-200",
                          textColor: "text-black",
                          text: {
                            name: "항상 같은 문자",
                            detail: [""],
                          },
                        },
                        value: [],
                      });
                      return now;
                    });
                  }}
                >
                  name 추가
                </Button>
                <Line highlighted />
              </>
            )}
          </div>
        ))}
        <Button
          onClick={() =>
            setInputs((prev) => {
              const now = [...prev];
              now.push({ type: "line", vars: [""] });
              return now;
            })
          }
        >
          다음 줄에서 변수를 입력받습니다.
        </Button>
        <Button
          onClick={() =>
            setInputs((prev) => {
              const now = [...prev];
              now.push({
                type: "board",
                N: "N",
                N_m1: "0",
                M: "M",
                M_m1: "0",
                space: false,
                cellTypes: [
                  {
                    name: "",
                    rule: {
                      name: "항상 거짓인 조건",
                      detail: [],
                    },
                    style: {
                      backgroundColor: "bg-green-200",
                      textColor: "text-black",
                      text: {
                        name: "항상 같은 문자",
                        detail: [""],
                      },
                    },
                    value: [],
                  },
                ],
              });
              return now;
            })
          }
        >
          다음 줄부터 공백으로 구분되지 않는 board를 입력받습니다.
        </Button>
        <Button
          onClick={() =>
            setInputs((prev) => {
              const now = [...prev];
              now.push({
                type: "board",
                N: "N",
                N_m1: "0",
                M: "M",
                M_m1: "0",
                space: true,
                cellTypes: [
                  {
                    name: "",
                    rule: {
                      name: "항상 거짓인 조건",
                      detail: [],
                    },
                    style: {
                      backgroundColor: "bg-green-200",
                      textColor: "text-black",
                      text: {
                        name: "항상 같은 문자",
                        detail: [""],
                      },
                    },
                    value: [],
                  },
                ],
              });
              return now;
            })
          }
        >
          다음 줄부터 공백으로 구분되는 board를 입력받습니다.
        </Button>
        <Button onClick={() => next(makecode())} rev highlighted>
          Next
        </Button>
      </div>
    </>
  );
}
