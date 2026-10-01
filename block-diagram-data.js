window.EGG_DIAGRAM_DATA = {
  "examples": [
    {
      "exactIds": [
        "mobile-3-1",
        "desktop-3-1"
      ],
      "caption": "一次发出三条检查消息",
      "roots": [
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "重复",
                {
                  "kind": "literal",
                  "text": "3"
                },
                "次"
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "已执行一次"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "试玩调试窗口应连续出现三条“已执行一次”；重复次数不代表秒间隔。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-3-2",
        "mobile-3-3",
        "desktop-3-2",
        "desktop-3-3"
      ],
      "caption": "钥匙开门的两个分支",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "先创建布尔变量“已有钥匙”，初始为假。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件",
            {
              "kind": "literal",
              "text": "试开门"
            },
            "（全局）"
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "variable",
                  "text": "已有钥匙"
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "允许开门"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "请先找钥匙"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "发送“试开门”测试假分支；把“已有钥匙”设为真后，再发送同名事件测试真分支。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-3-4",
        "desktop-3-4"
      ],
      "caption": "依次读出三个检查点名字",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备名为“字符串列表”的字符串列表变量，依次放入“起点”“桥头”“终点”。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "选取",
                {
                  "kind": "variable",
                  "text": "字符串列表"
                },
                "并执行动作"
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "value",
                      "text": "遍历的字符串值"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "循环内部取当前元素，输出顺序为起点、桥头、终点。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-3-5",
        "desktop-3-5"
      ],
      "caption": "核对 1 到 4 的真实执行次数",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "整数变量“累计”初始为 0，开启变量监听。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "从",
                {
                  "kind": "literal",
                  "text": "1"
                },
                "遍历到",
                {
                  "kind": "literal",
                  "text": "4"
                },
                "每次增加",
                {
                  "kind": "literal",
                  "text": "1"
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "设置",
                    {
                      "kind": "variable",
                      "text": "累计"
                    },
                    "为",
                    {
                      "kind": "value",
                      "text": "整数运算(+-×÷)",
                      "parts": [
                        {
                          "kind": "variable",
                          "text": "累计"
                        },
                        "+",
                        {
                          "kind": "literal",
                          "text": "1"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "实际遍历 1、2、3，终点 4 不执行；累计最终为 3。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-3-6",
        "desktop-3-6"
      ],
      "caption": "清点两行商品配置",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "先准备表格变量“商品表”：第 1 行“名称”是“苹果”，第 2 行“名称”是“面包”。“已读行数”初始为 0。下列积木接在填表动作之后。"
          ]
        },
        {
          "kind": "control",
          "parts": [
            "遍历",
            {
              "kind": "variable",
              "text": "商品表"
            },
            "的行，并执行动作"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置",
                {
                  "kind": "variable",
                  "text": "已读行数"
                },
                "为",
                {
                  "kind": "value",
                  "text": "整数运算(+-×÷)",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "已读行数"
                    },
                    "+",
                    {
                      "kind": "literal",
                      "text": "1"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "检查了一行"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "两行数据执行两次，已读行数最终为 2；不依赖行的遍历顺序。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-3-7",
        "desktop-3-7"
      ],
      "caption": "清点商品表的两个字段",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "先准备表格变量“商品表”：第 1 行“名称”是“苹果”，“价格”是 5。“已读列数”初始为 0。下列积木接在填表动作之后。"
          ]
        },
        {
          "kind": "control",
          "parts": [
            "遍历",
            {
              "kind": "variable",
              "text": "商品表"
            },
            "的列，并执行动作"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置",
                {
                  "kind": "variable",
                  "text": "已读列数"
                },
                "为",
                {
                  "kind": "value",
                  "text": "整数运算(+-×÷)",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "已读列数"
                    },
                    "+",
                    {
                      "kind": "literal",
                      "text": "1"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "检查了一列"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "名称、价格两个列执行两次；列名为字符串，不是整数序号。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-3-8",
        "desktop-3-8"
      ],
      "caption": "跳跃后才启动两秒计时",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "绑定一个可操作角色；布尔变量“已经注册”初始为假。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "角色"
            },
            "跳跃"
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "非",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "已经注册"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "设置",
                    {
                      "kind": "variable",
                      "text": "已经注册"
                    },
                    "为",
                    {
                      "kind": "literal",
                      "text": "真"
                    }
                  ]
                },
                {
                  "kind": "control",
                  "parts": [
                    "子触发器"
                  ],
                  "children": [
                    {
                      "kind": "event",
                      "parts": [
                        "经过",
                        {
                          "kind": "literal",
                          "text": "2"
                        },
                        "秒后"
                      ],
                      "children": [
                        {
                          "kind": "action",
                          "parts": [
                            "发送信息",
                            {
                              "kind": "literal",
                              "text": "跳跃后的两秒到了"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先站立 3 秒，再跳一次。两秒计时从子触发器注册开始；布尔变量防止反复注册。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-3-9",
        "desktop-3-9"
      ],
      "caption": "每两秒提示一次，共提示三次",
      "roots": [
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "经过",
                {
                  "kind": "literal",
                  "text": "2"
                },
                "秒执行下列动作，执行",
                {
                  "kind": "literal",
                  "text": "3"
                },
                "次，是否立刻执行",
                {
                  "kind": "literal",
                  "text": "假"
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "计时回调已执行"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "发送信息必须放在回调内部。约第 2、4、6 秒各出现一次。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-3-10",
        "desktop-3-10"
      ],
      "caption": "每十帧检查一次，共检查三次",
      "roots": [
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "经过",
                {
                  "kind": "literal",
                  "text": "10"
                },
                "帧执行下列动作，执行",
                {
                  "kind": "literal",
                  "text": "3"
                },
                "次，是否立刻执行",
                {
                  "kind": "literal",
                  "text": "假"
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "十帧检查到期"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "总共执行三次；帧数不能直接当成固定秒数。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "guide-1"
      ],
      "caption": "第一个蛋码：开局输出你好",
      "roots": [
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "你好，蛋码"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "开始试玩后，在调试窗口的信息分类查看输出。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "guide-2"
      ],
      "caption": "在两个触发器组里区分事件和动作",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "触发器组：开局检查"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "游戏开始"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "触发器组：交互检查"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "经过",
            {
              "kind": "literal",
              "text": "2"
            },
            "秒后"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "两秒到"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "两个事件分别启动自己的动作；触发器组名称不是运行顺序。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "guide-3"
      ],
      "caption": "用监听定位计分逻辑有没有执行",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "整数变量“拾取次数”初始为 0，开启变量监听。发送端统一发送“拾取测试”。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件",
            {
              "kind": "literal",
              "text": "拾取测试"
            },
            "（全局）"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "收到拾取测试"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置",
                {
                  "kind": "variable",
                  "text": "拾取次数"
                },
                "为",
                {
                  "kind": "value",
                  "text": "整数运算(+-×÷)",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "拾取次数"
                    },
                    "+",
                    {
                      "kind": "literal",
                      "text": "1"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "共发送三次，拾取次数最终为 3。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-3",
        "desktop-0-3"
      ],
      "caption": "开局把波次重置为零",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备整数变量“当前波次”，并开启监听。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置",
                {
                  "kind": "variable",
                  "text": "当前波次"
                },
                "为",
                {
                  "kind": "literal",
                  "text": "0"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "波次已重置"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-2",
        "desktop-0-2"
      ],
      "caption": "进入新关卡时记录一次初始化",
      "roots": [
        {
          "kind": "event",
          "parts": [
            "任意关卡初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "当前关卡开始初始化"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "有多关卡切换时进入另一关卡再次检查；不要把关卡初始化等同于游戏初始化。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-5",
        "desktop-0-5"
      ],
      "caption": "开局三秒后发送准备完成",
      "roots": [
        {
          "kind": "event",
          "parts": [
            "经过",
            {
              "kind": "literal",
              "text": "3"
            },
            "秒后"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "准备完成"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "放在关卡普通触发器组时，从初始化计时；只运行一次。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-6",
        "desktop-0-6"
      ],
      "caption": "每两秒显示一次巡检消息",
      "roots": [
        {
          "kind": "event",
          "parts": [
            "每经过",
            {
              "kind": "literal",
              "text": "2"
            },
            "秒后"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "巡检一次"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先观察约第 2、4、6 秒的输出。以下停止动作接到已有调试入口："
          ]
        },
        {
          "kind": "action",
          "parts": [
            "禁用触发器",
            {
              "kind": "literal",
              "text": "巡检触发器"
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "禁用后不再监听新的到期事件，但不撤销已经开始执行的逻辑。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-7",
        "desktop-0-7"
      ],
      "caption": "全关卡广播开门请求",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "发送端：把此动作接到已有测试入口。"
          ]
        },
        {
          "kind": "action",
          "parts": [
            "发送自定义事件",
            {
              "kind": "literal",
              "text": "开门请求"
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "接收端：单独建立以下触发器。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件",
            {
              "kind": "literal",
              "text": "开门请求"
            },
            "（全局）"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "关卡收到了开门请求"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-1",
        "desktop-0-1"
      ],
      "caption": "知道是谁按了领取按钮",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "先在界面控件中配置互动事件名“领取测试”，并显示该控件。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件",
            {
              "kind": "literal",
              "text": "领取测试"
            },
            "（附带玩家）"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "有玩家点击领取测试"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "玩家实际点击控件才发出事件；此通道仅接收角色进出区域或界面控件互动事件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-8",
        "desktop-0-8"
      ],
      "caption": "两扇同预设门，只通知其中一扇",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "发送端：已有测试入口中明确选择“左门”。场景中另有同预设实例“右门”。"
          ]
        },
        {
          "kind": "action",
          "parts": [
            "给",
            {
              "kind": "literal",
              "text": "左门"
            },
            "发送自定义事件",
            {
              "kind": "literal",
              "text": "开门"
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "对象预设内的接收触发器："
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件",
            {
              "kind": "literal",
              "text": "开门"
            },
            "（当前对象）"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "此门收到开门"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "第一次只通知左门；把发送目标改为右门可检查另一个实例。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-19",
        "desktop-0-19"
      ],
      "caption": "点击场景里的红方块",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "组件“红方块”先开启物理碰撞和屏幕交互的点击功能。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "红方块"
            },
            "被点击"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "点到了红方块"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "试玩直接点击方块，再点背景作对照。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-18",
        "desktop-0-18"
      ],
      "caption": "拖动拼图块，松手时记录一次",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "拼图组件先开启物理碰撞与屏幕交互拖动功能。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "拼图组件"
            },
            "被松开"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "拼图已松手"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置",
                {
                  "kind": "literal",
                  "text": "拼图组件"
                },
                "的坐标为",
                {
                  "kind": "value",
                  "text": "松开位置"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "这是包含可选“落实位置”步骤的版本。普通点击也会触发松开；运动器可能把坐标拉回去。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-17",
        "mobile-0-27",
        "desktop-0-17",
        "desktop-0-27"
      ],
      "caption": "靠近门后按互动按钮",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "给门组件开启互动功能，添加“检查门”按钮并设置互动范围。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "门组件"
            },
            "的互动按钮被按下"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "门的互动按钮被按下"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "靠近后按互动按钮，与直接点击组件模型不同。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-79",
        "desktop-0-79"
      ],
      "caption": "角色跳三次，日志出现三次",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "绑定一个可控制的角色。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "角色"
            },
            "跳跃"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "角色跳了一次"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "每次落地后再跳，完成三次独立跳跃并核对三次日志。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-114",
        "desktop-0-114"
      ],
      "caption": "角色进入检查区",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "检查区的事件类型在编辑器中选“表示进入”的项；下面“进入”表示选项含义，不是未核实的枚举常量。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "角色",
            {
              "kind": "literal",
              "text": "进入"
            },
            {
              "kind": "literal",
              "text": "检查区"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "角色进入检查区"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试角色从区外走入，离开后再进入；这里监听触发区域本体，不是互动按钮范围。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-78",
        "desktop-1-78"
      ],
      "caption": "向导说“欢迎来到训练场”",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "场景中准备生物“向导”，保持模型可见；下列动作接到已有触发入口。"
          ]
        },
        {
          "kind": "action",
          "parts": [
            "令",
            {
              "kind": "literal",
              "text": "向导"
            },
            "发送气泡信息",
            {
              "kind": "literal",
              "text": "欢迎来到训练场"
            },
            "持续时间",
            {
              "kind": "literal",
              "text": "3"
            },
            "隐藏距离",
            {
              "kind": "literal",
              "text": "20"
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "站在向导附近触发，观察头顶欢迎气泡，再走远核对隐藏距离。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-558",
        "desktop-4-558"
      ],
      "caption": "嵌入玩家名称，得到“小蛋，欢迎！”",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备玩家变量 P，保存当前在线玩家的引用。拼接的两项内联列表输入依次为“玩家名称(P)”和“，欢迎！”，列表本身不是额外的获取积木。"
          ]
        },
        {
          "kind": "value",
          "parts": [
            "拼接字符串：以",
            {
              "kind": "literal",
              "text": ""
            },
            "连接",
            {
              "kind": "literal",
              "text": "字符串列表",
              "parts": [
                {
                  "kind": "value",
                  "text": "玩家名称",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "P"
                    },
                    "的名称"
                  ]
                },
                {
                  "kind": "literal",
                  "text": "，欢迎！"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "空分隔符表示直接连接。若昵称为“小蛋”，结果为“小蛋，欢迎！”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-171",
        "desktop-0-171"
      ],
      "caption": "输入昵称后提交一次",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "界面编辑器先创建并显示输入框；试玩输入“蛋仔”并结束本次输入。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "当",
            {
              "kind": "literal",
              "text": "输入框"
            },
            "结束输入"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "本次输入已结束"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "输入结束时触发一次，不是每输入一个字符都触发。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-9",
        "desktop-0-9"
      ],
      "caption": "对象自己的界面确认请求",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "对象界面互动事件名为“确认”，发送目标必须指向该对象实例。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收界面自定义事件",
            {
              "kind": "literal",
              "text": "确认"
            },
            "（当前对象）"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "对象收到界面确认"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "界面发送配置属于准备步骤，不虚构一个未在手册中出现的发送积木。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-92",
        "desktop-0-92"
      ],
      "caption": "点击 NPC 模型本身",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "先为生物“测试 NPC”开启点击交互。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试 NPC"
            },
            "被点击"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "NPC 模型被点击"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "直接点击 NPC 模型；附近弹出的互动按钮属于另一种事件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-4",
        "desktop-0-4"
      ],
      "caption": "游戏结束前留一条收尾日志",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：使用已具有胜负和结算流程的测试地图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏结束"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "开始本局收尾"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：正常触发一次游戏结束。 在调试窗口检查消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：游戏结束前出现一次收尾消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：官方表述是结束前，不应教成结算界面显示完毕之后。 不能保证编辑器强制停止试玩等同于游戏内正常结束；测试请走已有的结束流程。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-10",
        "desktop-0-10"
      ],
      "caption": "到真实时刻才输出提醒",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：通过编辑器的时间戳参数选择器准备一个尚未到达的真实时刻。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "到达",
            {
              "kind": "literal",
              "text": "待填：未来真实时刻的时间戳"
            },
            "后"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "预约时刻已到"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：“时间戳到期”填入这个时间戳。 在该时刻前启动试玩并保持运行，观察到时输出。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：真实时间达到所填时刻后触发。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "案例未指定某个日期时刻。请使用编辑器时间戳选择器填入未来真实时刻；此槽是待填写的时间戳常量，不是整数秒数。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：填入时间戳类型，不要把整数 3 当成三秒后。 此条没有规定时区、过期时间戳及游戏未运行期间补发行为；这些应以编辑器实际表现核对。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-12",
        "desktop-0-12"
      ],
      "caption": "给拍照操作做调试记录",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：使用试玩中能够使用拍照功能的地图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "玩家拍照"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "发生拍照"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：打开拍照功能并完成一次实际拍照。 只打开拍照界面而不拍摄，再作对照。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：实际发生拍照时出现事件消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-13",
        "desktop-0-13"
      ],
      "caption": "剧情开场时记录开始",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一段已配置好的短剧情动画，先确认能够正常播放。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "剧情动画开始播放"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "剧情已经开始"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：通过已有播放入口完整播放一次动画，并查看输出时间。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：剧情动画开始播放时看到“剧情已经开始”。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：不要把普通角色动作动画或特效当成“剧情动画”。 手册没有定义跳过、强制中断是否触发结束；需额外核验，不能直接承诺。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-14",
        "desktop-0-14"
      ],
      "caption": "剧情完整播放后记录结束",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一段已配置好的短剧情动画，先确认能够正常播放。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "剧情动画结束播放"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "剧情已经结束"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：通过已有播放入口完整播放一次动画，并查看输出时间。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：剧情动画结束播放时看到“剧情已经结束”。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：不要把普通角色动作动画或特效当成“剧情动画”。 手册没有定义跳过、强制中断是否触发结束；需额外核验，不能直接承诺。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-15",
        "desktop-0-15"
      ],
      "caption": "只统计标记为测试弹的追踪命中",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备已有的追踪子弹发射逻辑，设置其字符串标记为“测试弹”。 场景中准备有效目标。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试弹"
            },
            "的追踪子弹击中目标"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试弹命中"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：事件“简易子弹击中目标”填“测试弹”。 发射该标记子弹命中目标，再用另一标记发射作对照。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：匹配标记的追踪子弹命中时输出消息；另一标记不会匹配这个监听。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-16",
        "desktop-0-16"
      ],
      "caption": "直线弹到目的地后输出到达",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备已有的直线子弹发射逻辑，标记为“路线测试”，指定可到达的目的地。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "路线测试"
            },
            "的直线子弹到达目标"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "直线弹已经到达"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：“简易直线子弹到达目标”填“路线测试”。 发射并等待子弹到达。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：带匹配标记的直线子弹到达目标时出现消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-20",
        "desktop-0-20"
      ],
      "caption": "测试木箱是否真的收到伤害",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：给测试木箱开启健康值并准备已有的伤害来源。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试木箱"
            },
            "受到伤害"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "木箱受伤"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：用伤害动作或已配置的攻击命中木箱。 再用没有开启健康值的普通装饰组件作对照。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：配置正确的木箱受到伤害时输出事件消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-21",
        "desktop-0-21"
      ],
      "caption": "NPC 门牌的互动范围提示",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：给门牌组件开启互动功能并配置可见的互动范围。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "角色",
            {
              "kind": "literal",
              "text": "进入"
            },
            {
              "kind": "literal",
              "text": "门牌组件"
            },
            "的互动区域"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "角色进入门牌互动范围"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：从范围外走入，再走出后重新走入。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：每次满足所选进入方向时出现消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "“进入”只标明应选择的进出含义；请从编辑器下拉项选择，手册未公布该类型的枚举常量名。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：第一个参数是触发区域类型，第二个才是组件。 手册没有列举该类型的枚举字面名，教程应让读者选择界面中对应进入或离开的项，不编造枚举常量。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-31",
        "desktop-0-31"
      ],
      "caption": "开始走路时亮起调试信号",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个已存在、可操作的测试角色，把它作为事件的“角色I生物”参数。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "开始移动"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "开始移动"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：再操作未绑定到该事件的另一角色作对照。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：所选对象发生对应行为时输出“开始移动”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-32",
        "desktop-0-32"
      ],
      "caption": "停下脚步时记录移动结束",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个已存在、可操作的测试角色，把它作为事件的“角色I生物”参数。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "移动结束"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "移动结束"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：先让测试角色移动，再让其停止。 再操作未绑定到该事件的另一角色作对照。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：所选对象发生对应行为时输出“移动结束”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-36",
        "desktop-0-36"
      ],
      "caption": "测试角色每跳一次记一条消息",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个已存在、可操作的测试角色，把它作为事件的“角色I生物”参数。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "跳跃"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "发生跳跃"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：操作测试角色跳跃一次。 再操作未绑定到该事件的另一角色作对照。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：所选对象发生对应行为时输出“发生跳跃”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-33",
        "desktop-0-33"
      ],
      "caption": "测试前扑动作是否发生",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个已存在、可操作的测试角色，把它作为事件的“角色I生物”参数。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "前扑"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "发生前扑"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：操作测试角色执行前扑。 再操作未绑定到该事件的另一角色作对照。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：所选对象发生对应行为时输出“发生前扑”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-34",
        "desktop-0-34"
      ],
      "caption": "开始滚动时检查入口",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个已存在、可操作的测试角色，把它作为事件的“角色I生物”参数。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "滚动开始"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "滚动开始"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让测试角色开始滚动。 再操作未绑定到该事件的另一角色作对照。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：所选对象发生对应行为时输出“滚动开始”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-35",
        "desktop-0-35"
      ],
      "caption": "滚动结束时检查收尾",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个已存在、可操作的测试角色，把它作为事件的“角色I生物”参数。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "滚动结束"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "滚动结束"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：再操作未绑定到该事件的另一角色作对照。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：所选对象发生对应行为时输出“滚动结束”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-54",
        "desktop-0-54"
      ],
      "caption": "空抓也算一次抓举尝试",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个可操作角色和一个可被举起的测试组件。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "抓举"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "进行了抓举尝试"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：先面对空地按抓举，再面对组件成功抓举。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：空抓与抓到物体都能触发此事件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-78",
        "desktop-0-78"
      ],
      "caption": "只记录角色的空抓输入",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个可操作的测试角色。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "抓举"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "角色按了抓举"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：面对没有可举物体的位置按抓举。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：没有举起物体仍会出现消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-81",
        "desktop-0-81"
      ],
      "caption": "成功搬起箱子才计数",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备可操作角色和能够被该角色举起的箱子。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "把其他物体举起"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "已经举起物体"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：先在空地尝试抓举，再对箱子完成举起。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：仅成功把其他物体举起时输出消息，空抓不完成这个例子的条件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-46",
        "desktop-0-46"
      ],
      "caption": "攻击者的扣血前检查点",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备攻击者 A 与健康值充足的目标 B，先使用一次不会击败 B 的小伤害攻击。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "攻击者 A"
            },
            "造成伤害前"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "造成伤害前"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让 A 攻击 B 一次，结合健康值观察或变量监听检查时点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：在扣除 B 的健康值之前输出事件消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：官方允许在伤害前事件修改来源、目标和值，但此处没有列出修改动作的确切名字，不能虚构积木。 不要在伤害事件内无条件再造成同样的伤害，避免递归触发。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-47",
        "desktop-0-47"
      ],
      "caption": "攻击者的扣血后检查点",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备攻击者 A 与健康值充足的目标 B，先使用一次不会击败 B 的小伤害攻击。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "攻击者 A"
            },
            "造成伤害后"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "造成伤害后"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让 A 攻击 B 一次，结合健康值观察或变量监听检查时点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：在本次伤害扣血之后输出事件消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：扣血后目标可能已经被击败；执行后续对象操作前检查目标当前是否仍可用。 伤害后的回调不适合作为阻止本次扣血的入口。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-48",
        "desktop-0-48"
      ],
      "caption": "受伤者的扣血前检查点",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备攻击者 A 与健康值充足的目标 B，先使用一次不会击败 B 的小伤害攻击。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "目标 B"
            },
            "受到伤害前"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "受到伤害前"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让 A 攻击 B 一次，结合健康值观察或变量监听检查时点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：在扣除 B 的健康值之前输出事件消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：官方允许在伤害前事件修改来源、目标和值，但此处没有列出修改动作的确切名字，不能虚构积木。 不要在伤害事件内无条件再造成同样的伤害，避免递归触发。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-49",
        "desktop-0-49"
      ],
      "caption": "受伤者的扣血后检查点",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备攻击者 A 与健康值充足的目标 B，先使用一次不会击败 B 的小伤害攻击。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "目标 B"
            },
            "受到伤害后"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "受到伤害后"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让 A 攻击 B 一次，结合健康值观察或变量监听检查时点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：在本次伤害扣血之后输出事件消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：扣血后目标可能已经被击败；执行后续对象操作前检查目标当前是否仍可用。 伤害后的回调不适合作为阻止本次扣血的入口。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-52",
        "desktop-0-52"
      ],
      "caption": "接触物理箱子时检查碰撞开始",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：场景放测试箱子，开启组件受外力属性，保证碰撞关系允许接触。 绑定一个测试角色；默认角色和生物属于受外力物体。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "发生碰撞开始"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "碰撞开始"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让角色接触箱子，再与箱子分离，观察对应时点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：有效物理接触开始时输出消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：不能只凭画面重叠就断言存在可触发的物理碰撞。 组件需要开启受外力属性；官方不保证所有静态物体互相接触都产生这些事件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-53",
        "desktop-0-53"
      ],
      "caption": "推开物体后检查碰撞结束",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：场景放测试箱子，开启组件受外力属性，保证碰撞关系允许接触。 绑定一个测试角色；默认角色和生物属于受外力物体。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "发生碰撞结束"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "碰撞结束"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让角色接触箱子，再与箱子分离，观察对应时点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：有效物理接触结束时输出消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：不能只凭画面重叠就断言存在可触发的物理碰撞。 组件需要开启受外力属性；官方不保证所有静态物体互相接触都产生这些事件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-62",
        "desktop-0-62"
      ],
      "caption": "背包里换一个物品格",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备持有物品且能更换槽位的测试角色，确认至少有两个合法槽位。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "持有物品槽位发生变化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "持有物品槽位改变"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：把已持有物品从原槽位换到另一个合法槽位。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：槽位位置变化时出现消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-115",
        "desktop-0-115"
      ],
      "caption": "生物进入检查区",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：放置一个名为“检查区”的触发区域，确保其空间边界清晰可验证。 准备测试生物，初始位置在检查区外。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "生物",
            {
              "kind": "literal",
              "text": "进入"
            },
            {
              "kind": "literal",
              "text": "检查区"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "生物进入检查区"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让测试生物跨过边界进入检查区，然后离开并再进入。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：每次匹配所选进出方向的边界变化时输出消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "“进入”表示在进出类型下拉项选择对应含义，不代表已核实的枚举标识符；事件监听的是检查区本体。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：这是触发区域本身的进出，不是它附加的互动按钮范围。 官方未给出触发区域类型枚举的字面名，不写未经核实的枚举常量。 电脑端有些描述省掉触发区域占位符，但参数列表仍有第二个触发区域参数。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-116",
        "desktop-0-116"
      ],
      "caption": "组件进入检查区",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：放置一个名为“检查区”的触发区域，确保其空间边界清晰可验证。 准备可移动箱子，初始位置在检查区外。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "组件",
            {
              "kind": "literal",
              "text": "进入"
            },
            {
              "kind": "literal",
              "text": "检查区"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "组件进入检查区"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让可移动箱子跨过边界进入检查区，然后离开并再进入。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：每次匹配所选进出方向的边界变化时输出消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "“进入”表示在进出类型下拉项选择对应含义，不代表已核实的枚举标识符；事件监听的是检查区本体。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：这是触发区域本身的进出，不是它附加的互动按钮范围。 官方未给出触发区域类型枚举的字面名，不写未经核实的枚举常量。 电脑端有些描述省掉触发区域占位符，但参数列表仍有第二个触发区域参数。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-117",
        "desktop-0-117"
      ],
      "caption": "载具进入检查区",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：放置一个名为“检查区”的触发区域，确保其空间边界清晰可验证。 准备测试载具，初始位置在检查区外。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "载具",
            {
              "kind": "literal",
              "text": "进入"
            },
            {
              "kind": "literal",
              "text": "检查区"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "载具进入检查区"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让测试载具跨过边界进入检查区，然后离开并再进入。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：每次匹配所选进出方向的边界变化时输出消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "“进入”表示在进出类型下拉项选择对应含义，不代表已核实的枚举标识符；事件监听的是检查区本体。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：这是触发区域本身的进出，不是它附加的互动按钮范围。 官方未给出触发区域类型枚举的字面名，不写未经核实的枚举常量。 电脑端有些描述省掉触发区域占位符，但参数列表仍有第二个触发区域参数。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-110",
        "desktop-0-110"
      ],
      "caption": "物品进入检查区",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：放置一个名为“检查区”的触发区域，确保其空间边界清晰可验证。 准备可放入场景的测试物品，初始位置在检查区外。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "物品",
            {
              "kind": "literal",
              "text": "进入"
            },
            {
              "kind": "literal",
              "text": "检查区"
            },
            "触发区域"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "物品进入检查区"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让可放入场景的测试物品跨过边界进入检查区，然后离开并再进入。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：每次匹配所选进出方向的边界变化时输出消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "“进入”表示在进出类型下拉项选择对应含义，不代表已核实的枚举标识符；事件监听的是检查区本体。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：这是触发区域本身的进出，不是它附加的互动按钮范围。 官方未给出触发区域类型枚举的字面名，不写未经核实的枚举常量。 电脑端有些描述省掉触发区域占位符，但参数列表仍有第二个触发区域参数。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-111",
        "desktop-0-111"
      ],
      "caption": "角色/生物进入检查区",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：放置一个名为“检查区”的触发区域，确保其空间边界清晰可验证。 准备测试角色或生物，初始位置在检查区外。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "角色/生物",
            {
              "kind": "literal",
              "text": "进入"
            },
            {
              "kind": "literal",
              "text": "检查区"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "角色/生物进入检查区"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让测试角色或生物跨过边界进入检查区，然后离开并再进入。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：每次匹配所选进出方向的边界变化时输出消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "“进入”表示在进出类型下拉项选择对应含义，不代表已核实的枚举标识符；事件监听的是检查区本体。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：这是触发区域本身的进出，不是它附加的互动按钮范围。 官方未给出触发区域类型枚举的字面名，不写未经核实的枚举常量。 电脑端有些描述省掉触发区域占位符，但参数列表仍有第二个触发区域参数。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-118",
        "desktop-0-118"
      ],
      "caption": "开启监听后观察设备倾斜",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备支持陀螺仪的真实设备和测试玩家。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试玩家"
            },
            "的陀螺仪发生变化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "陀螺仪发生变化"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：通过“设置玩家开启陀螺仪监听”选择玩家，布尔值设为真。 试玩轻轻改变设备姿态，观察日志。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：监听开启后，设备姿态产生可检测变化时出现事件输出。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：电脑端有该积木条目不等于电脑一定具有陀螺仪硬件。 陀螺仪数据可能高频变化，正式玩法不宜每次都大量输出日志。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-128",
        "desktop-0-128"
      ],
      "caption": "玩家积分从零改为十分",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个积分初始为 0 的测试玩家。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "任意玩家积分变化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "玩家积分已改变"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：通过“设置玩家积分”把该玩家积分设为整数 10。 观察积分与事件消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：积分发生 0 到 10 的变化时出现消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：不要在此事件里无条件继续修改积分，否则可能再次触发自身。 设置成与原值相同的数是否仍触发，官方没有保证。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-129",
        "desktop-0-129"
      ],
      "caption": "团队成员得分带动阵营积分",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：使用团队积分模式，准备已加入阵营的测试玩家。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "任意阵营积分变化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "阵营积分已更新"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：改变该玩家积分，观察所属阵营积分。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：团队积分产生变化时触发阵营事件。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：普通个人积分演示不能据此保证阵营关联行为。 区分直接设置阵营积分与成员积分带来的变化，避免重复累加。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-134",
        "desktop-0-134"
      ],
      "caption": "核对技能施法开始的时点",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个明确配置了施法阶段的技能，并让测试角色已持有该技能。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "施法阶段开始"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "施法开始"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：发动技能并让施法阶段正常走完。 对照技能配置的阶段和调试输出核对时点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：进入施法阶段时收到消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：事件参数是角色对象，不是技能预设。 没有配置该阶段的技能不能用来证明该事件是否正常。 不要承诺被打断也一定触发正常结束事件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-135",
        "desktop-0-135"
      ],
      "caption": "核对技能施法结束的时点",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个明确配置了施法阶段的技能，并让测试角色已持有该技能。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "施法阶段结束"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "施法结束"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：发动技能并让施法阶段正常走完。 对照技能配置的阶段和调试输出核对时点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：施法时间正常走完时收到消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：事件参数是角色对象，不是技能预设。 没有配置该阶段的技能不能用来证明该事件是否正常。 不要承诺被打断也一定触发正常结束事件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-136",
        "desktop-0-136"
      ],
      "caption": "核对技能施法被打断的时点",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个明确配置了施法阶段的技能，并让测试角色已持有该技能。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "施法阶段被打断"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "施法被打断"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：发动技能进入施法阶段，再用地图中已配置的取消、失控或自身行为中断机制使该阶段中断。 对照技能配置的阶段和调试输出核对时点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：施法阶段被实际中断时收到消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：事件参数是角色对象，不是技能预设。 没有配置该阶段的技能不能用来证明该事件是否正常。 不同阶段可中断的条件不同：施法说明提到失控或自身行为，蓄力另提到取消；不要随意保证某个按键一定触发打断。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-137",
        "desktop-0-137"
      ],
      "caption": "核对技能蓄力开始的时点",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个明确配置了蓄力阶段的技能，并让测试角色已持有该技能。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "蓄力阶段开始"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "蓄力开始"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：发动技能并让蓄力阶段正常走完。 对照技能配置的阶段和调试输出核对时点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：进入蓄力阶段时收到消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：事件参数是角色对象，不是技能预设。 没有配置该阶段的技能不能用来证明该事件是否正常。 不要承诺被打断也一定触发正常结束事件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-138",
        "desktop-0-138"
      ],
      "caption": "核对技能蓄力结束的时点",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个明确配置了蓄力阶段的技能，并让测试角色已持有该技能。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "蓄力阶段结束"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "蓄力结束"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：发动技能并让蓄力阶段正常走完。 对照技能配置的阶段和调试输出核对时点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：蓄力时间正常走完时收到消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：事件参数是角色对象，不是技能预设。 没有配置该阶段的技能不能用来证明该事件是否正常。 不要承诺被打断也一定触发正常结束事件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-139",
        "desktop-0-139"
      ],
      "caption": "核对技能蓄力被打断的时点",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个明确配置了蓄力阶段的技能，并让测试角色已持有该技能。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "蓄力阶段被打断"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "蓄力被打断"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：发动技能进入蓄力阶段，再用地图中已配置的取消、失控或自身行为中断机制使该阶段中断。 对照技能配置的阶段和调试输出核对时点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：蓄力阶段被实际中断时收到消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：事件参数是角色对象，不是技能预设。 没有配置该阶段的技能不能用来证明该事件是否正常。 不同阶段可中断的条件不同：施法说明提到失控或自身行为，蓄力另提到取消；不要随意保证某个按键一定触发打断。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-155",
        "desktop-0-155"
      ],
      "caption": "让指定技能完成一次冷却",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备已持有、能够施放并且冷却时间大于零的技能实例。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "技能实例"
            },
            "技能冷却完成"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "这个技能冷却完成"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：施放一次技能，使其进入冷却，等待冷却结束。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：该技能冷却完成时输出消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-162",
        "desktop-0-162"
      ],
      "caption": "物品使用前检查入口",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个确实可被使用的物品实例，让测试角色持有它。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "可使用的物品实例"
            },
            "即将被使用"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "正在尝试使用此物品"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：试玩选择并使用物品一次，观察消息与效果。 若要增加使用限制，应选择编辑器在此事件上下文中提供的阻止使用动作并核对实际名称。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：物品的使用行为真正生效之前能进入此事件。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：此条未提供阻止动作的确切名称和参数，不能自行发明“取消本次使用”等积木。 只选中物品与即将使用物品是两件事。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-166",
        "desktop-0-166"
      ],
      "caption": "拾取可堆叠物品时检查事件返回",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备允许堆叠的同一种物品，测试角色已持有其中一份。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "待获得的物品"
            },
            "被 角色/生物 获得"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "获得了物品"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让角色获得第二份并产生自动堆叠。 后续需要操作物品时使用此事件给出的物品对象，核对堆叠层数。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：获得时收到事件，自动堆叠情况下应继续处理事件返回的堆叠物品。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：不能假定地上的独立物品实例在堆叠后仍然是后续要操作的对象。 参数是物品实例，不是物品预设。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-168",
        "desktop-0-168"
      ],
      "caption": "玩家向普通商店购买一件货物",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备已经能交易的商店，配置一个非付费道具的普通商品。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "商店"
            },
            "出售物品"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "商店卖出一件商品"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让测试玩家完成一次普通商品购买。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：商店出售普通物品时出现消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：官方明确指出付费道具不会触发此事件。 玩家把物品卖回商店应使用“商店收购物品”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-169",
        "desktop-0-169"
      ],
      "caption": "玩家把物品卖给商店",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备支持收购的商店和玩家持有的可售物品。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "商店"
            },
            "收购物品"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "商店收购了一件物品"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：玩家完成一次向该商店出售物品的操作。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：商店收购完成产生该事件消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-170",
        "desktop-0-170"
      ],
      "caption": "在专用手势区域内划一下",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在界面编辑器创建并显示一个手势区域控件，确保其范围能被看见或定位。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "UI 手势节点"
            },
            "滑动事件"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "手势区域收到滑动"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：分别在区域内滑动和区域外滑动，检查输出。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：区域内发生识别到的滑动时触发；区域外不应匹配该节点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：普通图片、按钮、输入框都不等同于 UI 手势节点。 手册没有列出方向、距离、速度等事件参数，不能凭空声称此积木直接返回这些值。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-175",
        "desktop-0-175"
      ],
      "caption": "任意玩家完成新手任务时提示",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个已有明确完成条件的新手任务。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "任意玩家的",
            {
              "kind": "literal",
              "text": "新手任务"
            },
            "达到",
            {
              "kind": "literal",
              "text": "成功"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "有玩家完成了新手任务"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：任选一名测试玩家完成任务，再让另一名玩家完成作对照。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：任意玩家的这个任务达到成功状态时触发。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：状态选“成功”与“待提交”不同，按真实任务流程选择。 电脑端描述省掉状态占位符，但第二个任务状态参数仍必须填写。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-177",
        "desktop-0-177"
      ],
      "caption": "只关注玩家甲的任务成功",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备玩家甲、玩家乙和一个可完成的测试任务。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "玩家甲"
            },
            "的",
            {
              "kind": "literal",
              "text": "测试任务"
            },
            "达到",
            {
              "kind": "literal",
              "text": "成功"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "玩家甲已完成测试任务"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：先让乙完成，再让甲完成。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：玩家甲达到所选任务状态时触发；乙完成不能满足这条指定玩家监听。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：参数第一项是玩家，不是角色。 电脑端描述省略状态占位符，参数列表仍明确有第三项任务状态。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-176",
        "desktop-0-176"
      ],
      "caption": "新手任务进入指定步骤时提示",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个多步骤任务，从任务配置中记下要监听步骤的真实索引。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "任意玩家的",
            {
              "kind": "literal",
              "text": "多步骤任务"
            },
            "开始",
            {
              "kind": "literal",
              "text": "待填：配置中的步骤索引"
            },
            "步骤"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "已进入目标任务步骤"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：测试玩家推进任务，直到这个步骤真正开始。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：到指定索引的步骤开始时输出消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "精选案例未指定步骤编号。此槽必须填任务配置中已确认的整数索引；不要把这里的提示文字作为参数，也不要默认索引从 0 或 1 开始。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：手册强调填步骤索引；不要把步骤名称文本填进整数参数。 没有证据说明步骤索引从 0 还是 1 开始，必须从任务配置核对，不能默认。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-28",
        "desktop-0-28"
      ],
      "caption": "坐上测试椅子后确认家具互动成功",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：放置测试椅子组件，开启互动功能并添加“家具互动”。 在家具互动中配置有效组件挂点和对应动画；先确认试玩角色能正常坐上椅子。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试椅子"
            },
            "的家具互动成功触发"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "已经坐上测试椅子"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：试玩走入互动范围，按椅子的家具互动按钮。 确认角色成功在配置挂点播放动画，再核对消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：角色成功进入这件家具的互动时出现消息；只靠近椅子不会产生这个成功结果。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：家具互动需要挂点和动画配置，不是任意组件只添加监听就能坐下。 “互动按钮被按下”记录请求，“家具互动成功触发”记录成功，不应当作同一个时点。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-22",
        "desktop-0-22"
      ],
      "caption": "动态生成一个测试方块时确认初始化",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：保存一个组件预设，命名“测试方块”；在该预设的蛋码中配置创建监听，事件对象选择预设运行时的自身实例。 准备一个安全生成位置，并在场景测试入口中选定有效所属玩家；所需旋转和缩放从正常放置实例的配置复制。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试方块（当前实例）"
            },
            "被创建"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试方块已创建"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：测试入口使用“创建组件”，预设选“测试方块”，位置选安全生成位置，其余所需参数按准备的配置填写。 试玩触发一次创建；隔两秒再创建第二个实例。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：每次成功生成实例时，该实例的创建监听各执行一次，两个实例能得到两次检查消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "这段触发器放在“测试方块”预设的蛋码中。对象目标槽表示当前运行时实例，不是预设资源，也不是新建的获取积木。创建监听不能在实例已创建后补注册并期望收到过去的事件。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：创建监听要在预设内部随实例初始化建立，不能等创建完成后再注册监听并期待补收过去事件。 创建动作输入的是组件预设，事件所监听的是创建出的组件实例，不能混用。 例子输出只证明事件已到达；不要据此保证所有其他对象也已完成初始化。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-94",
        "desktop-0-94"
      ],
      "caption": "动态生成一个测试小怪时确认初始化",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：保存一个生物预设，命名“测试小怪”；在该预设的蛋码中配置创建监听，事件对象选择预设运行时的自身实例。 准备一个安全生成位置，并在场景测试入口中选定有效所属玩家；所需旋转和缩放从正常放置实例的配置复制。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试小怪（当前实例）"
            },
            "被创建"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试小怪已创建"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：测试入口使用“创建生物”，预设选“测试小怪”，位置选安全生成位置，其余所需参数按准备的配置填写。 试玩触发一次创建；隔两秒再创建第二个实例。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：每次成功生成实例时，该实例的创建监听各执行一次，两个实例能得到两次检查消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "这段触发器放在“测试小怪”预设的蛋码中。对象目标槽表示当前运行时实例，不是预设资源，也不是新建的获取积木。创建监听不能在实例已创建后补注册并期望收到过去的事件。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：创建监听要在预设内部随实例初始化建立，不能等创建完成后再注册监听并期待补收过去事件。 创建动作输入的是生物预设，事件所监听的是创建出的生物实例，不能混用。 例子输出只证明事件已到达；不要据此保证所有其他对象也已完成初始化。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-106",
        "desktop-0-106"
      ],
      "caption": "动态生成一个测试逻辑体时确认初始化",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：保存一个逻辑体预设，命名“测试逻辑体”；在该预设的蛋码中配置创建监听，事件对象选择预设运行时的自身实例。 准备一个安全生成位置，并在场景测试入口中选定有效所属玩家；所需旋转和缩放从正常放置实例的配置复制。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试逻辑体（当前实例）"
            },
            "被创建"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试逻辑体已创建"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：测试入口使用“创建逻辑体”，预设选“测试逻辑体”，位置选安全生成位置，其余所需参数按准备的配置填写。 试玩触发一次创建；隔两秒再创建第二个实例。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：每次成功生成实例时，该实例的创建监听各执行一次，两个实例能得到两次检查消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "这段触发器放在“测试逻辑体”预设的蛋码中。对象目标槽表示当前运行时实例，不是预设资源，也不是新建的获取积木。创建监听不能在实例已创建后补注册并期望收到过去的事件。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：创建监听要在预设内部随实例初始化建立，不能等创建完成后再注册监听并期待补收过去事件。 创建动作输入的是逻辑体预设，事件所监听的是创建出的逻辑体实例，不能混用。 例子输出只证明事件已到达；不要据此保证所有其他对象也已完成初始化。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-112",
        "desktop-0-112"
      ],
      "caption": "动态生成一个测试检测区时确认初始化",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：保存一个触发区域预设，命名“测试检测区”；在该预设的蛋码中配置创建监听，事件对象选择预设运行时的自身实例。 准备一个安全生成位置，并在场景测试入口中选定有效所属玩家；所需旋转和缩放从正常放置实例的配置复制。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试检测区（当前实例）"
            },
            "被创建"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试检测区已创建"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：测试入口使用“创建触发区域”，预设选“测试检测区”，位置选安全生成位置，其余所需参数按准备的配置填写。 试玩触发一次创建；隔两秒再创建第二个实例。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：每次成功生成实例时，该实例的创建监听各执行一次，两个实例能得到两次检查消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "这段触发器放在“测试检测区”预设的蛋码中。对象目标槽表示当前运行时实例，不是预设资源，也不是新建的获取积木。创建监听不能在实例已创建后补注册并期望收到过去的事件。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：创建监听要在预设内部随实例初始化建立，不能等创建完成后再注册监听并期待补收过去事件。 创建动作输入的是触发区域预设，事件所监听的是创建出的触发区域实例，不能混用。 例子输出只证明事件已到达；不要据此保证所有其他对象也已完成初始化。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-172",
        "desktop-0-172"
      ],
      "caption": "动态生成一个测试道具箱时确认初始化",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：保存一个道具箱预设，命名“测试道具箱”；在该预设的蛋码中配置创建监听，事件对象选择预设运行时的自身实例。 准备一个安全生成位置，并在场景测试入口中选定有效所属玩家；所需旋转和缩放从正常放置实例的配置复制。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试道具箱（当前实例）"
            },
            "被创建"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试道具箱已创建"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：测试入口使用“创建道具箱”，预设选“测试道具箱”，位置选安全生成位置，其余所需参数按准备的配置填写。 试玩触发一次创建；隔两秒再创建第二个实例。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：每次成功生成实例时，该实例的创建监听各执行一次，两个实例能得到两次检查消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "这段触发器放在“测试道具箱”预设的蛋码中。对象目标槽表示当前运行时实例，不是预设资源，也不是新建的获取积木。创建监听不能在实例已创建后补注册并期望收到过去的事件。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：创建监听要在预设内部随实例初始化建立，不能等创建完成后再注册监听并期待补收过去事件。 创建动作输入的是道具箱预设，事件所监听的是创建出的道具箱实例，不能混用。 例子输出只证明事件已到达；不要据此保证所有其他对象也已完成初始化。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-23",
        "desktop-0-23"
      ],
      "caption": "删除测试方块时记录一次清理",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个运行时已存在的组件实例“测试方块”，将实例引用保存到相应类型的变量。 先建立监听，再允许测试入口执行销毁；测试对象不要绑定子组件，便于只检查一个目标。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试方块"
            },
            "被销毁"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试方块已销毁"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：在独立的调试事件中放“销毁组件”，目标使用同一实例，销毁子组件布尔参数填假。 试玩触发一次销毁，确认场景对象与调试输出。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：所选组件被删除后收到销毁消息；继续操作需要另行创建新实例。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-98",
        "desktop-0-98"
      ],
      "caption": "删除测试小怪时记录一次清理",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个运行时已存在的生物实例“测试小怪”，将实例引用保存到相应类型的变量。 先建立监听，再允许测试入口执行销毁；测试对象不要绑定子组件，便于只检查一个目标。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试小怪"
            },
            "被销毁"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试小怪已销毁"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：在独立的调试事件中放“销毁生物”，目标使用同一实例，销毁子组件布尔参数填假。 试玩触发一次销毁，确认场景对象与调试输出。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：所选生物被删除后收到销毁消息；继续操作需要另行创建新实例。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：销毁回调里先只做日志或清理独立数据，不再把旧对象当作有效目标修改。 销毁是删除生物，不等于击败；应分别监听销毁与被击败。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-107",
        "desktop-0-107"
      ],
      "caption": "删除测试逻辑体时记录一次清理",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个运行时已存在的逻辑体实例“测试逻辑体”，将实例引用保存到相应类型的变量。 先建立监听，再允许测试入口执行销毁；测试对象不要绑定子组件，便于只检查一个目标。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试逻辑体"
            },
            "被销毁"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试逻辑体已销毁"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：在独立的调试事件中放“销毁逻辑体”，目标使用同一实例，销毁子组件布尔参数填假。 试玩触发一次销毁，确认场景对象与调试输出。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：所选逻辑体被删除后收到销毁消息；继续操作需要另行创建新实例。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-113",
        "desktop-0-113"
      ],
      "caption": "删除测试检测区时记录一次清理",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个运行时已存在的触发区域实例“测试检测区”，将实例引用保存到相应类型的变量。 先建立监听，再允许测试入口执行销毁；测试对象不要绑定子组件，便于只检查一个目标。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试检测区"
            },
            "被销毁"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试检测区已销毁"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：在独立的调试事件中放“销毁触发区域”，目标使用同一实例，销毁子组件布尔参数填假。 试玩触发一次销毁，确认场景对象与调试输出。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：所选触发区域被删除后收到销毁消息；继续操作需要另行创建新实例。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：销毁回调里先只做日志或清理独立数据，不再把旧对象当作有效目标修改。 移到看不见的位置或关闭显示不等于销毁。 “销毁触发区域”动作原说明误写成生物销毁事件；应按该事件自身明确的触发区域类型验证，不复制这句笔误。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-173",
        "desktop-0-173"
      ],
      "caption": "删除测试道具箱时记录一次清理",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个运行时已存在的道具箱实例“测试道具箱”，将实例引用保存到相应类型的变量。 先建立监听，再允许测试入口执行销毁；测试对象不要绑定子组件，便于只检查一个目标。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试道具箱"
            },
            "被销毁"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试道具箱已销毁"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：在独立的调试事件中放“销毁道具箱”，目标使用同一实例。 试玩触发一次销毁，确认场景对象与调试输出。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：所选道具箱被删除后收到销毁消息；该道具箱不再刷新拾取道具。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-24",
        "desktop-0-24"
      ],
      "caption": "箱子真的被搬起来才计数",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：放置可被抓举的测试箱，开启受外力属性并确认角色能举起它。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试箱"
            },
            "被举起"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试箱已被举起"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：角色先面对空地抓举一次，再靠近测试箱将它真正举起。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：空抓不会让测试箱产生被举起事件；成功搬起箱子时出现消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-25",
        "desktop-0-25"
      ],
      "caption": "搬运任务放下箱子后检查",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备可被举起的测试箱与一个标记清楚的目标摆放区。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试箱"
            },
            "被放下"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试箱已经被放下"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：角色先举起箱子，走到目标区后放下。 在区外再做一次举起和放下，对比事件本身。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：每次箱子被放下都会收到消息；是否在正确区域需要另加位置或区域判断。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-109",
        "desktop-0-109"
      ],
      "caption": "进入区域后按传送互动按钮",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：放置测试触发区域，开启互动并添加按钮“确认传送”，暂时不接实际传送动作。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试触发区域"
            },
            "的互动按钮被按下"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "玩家确认了传送"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：角色走入互动范围，先不操作，确认没有这条消息。 再点击“确认传送”按钮。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：只有实际按下该互动按钮时出现确认消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-119",
        "desktop-0-119"
      ],
      "caption": "收集三次后完成测试成就",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在“更多 → 游玩进度”新建成就“收集三次”，目标进度设为 3。 使用尚未完成这个成就的测试玩家。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试玩家"
            },
            "完成成就"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "玩家完成了一个成就"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：通过“增加玩家成就进度”，选择该玩家和“收集三次”，每次增加整数 1，分三次触发。 对比第 1、2 次与第 3 次增加后的输出。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：达到目标进度时成就完成，进入完成事件；未达到目标时只是增加进度。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：已完成成就不能通过“设置玩家成就进度”重新设置；重复验证需要未完成的测试状态。 此事件只筛选玩家，没有成就参数槽；需要限定某个成就时必须另核对事件上下文。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-123",
        "desktop-0-123"
      ],
      "caption": "完成成就后再领取一次奖励",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备含可领取奖励的测试成就，让测试玩家已完成它但尚未领取。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试玩家"
            },
            "领取",
            {
              "kind": "literal",
              "text": "测试成就"
            },
            "成就奖励"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试成就奖励已领取"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：进入该成就的奖励界面，完成领取操作。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：领取奖励时出现消息；仅把成就进度推到目标不会替代这次领取操作。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：完成成就与领取奖励有不同事件。 本条没有定义自动发奖或重复领取行为，例子使用明确可手动领取的一次奖励。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-120",
        "desktop-0-120"
      ],
      "caption": "打开守门人的剧情对话",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在剧情对话配置中准备一个可正常显示的剧情预设“守门人问候”。 保存测试玩家对象。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试玩家"
            },
            "开始对话"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "守门人对话开始"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：测试入口使用“开启对话”：玩家选测试玩家，剧情预设选“守门人问候”。 试玩触发入口，确认对话真正打开。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：该玩家开始对话时出现消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-121",
        "desktop-0-121"
      ],
      "caption": "结束已经打开的守门人对话",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：让测试玩家先通过“开启对话”打开剧情预设“守门人问候”。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试玩家"
            },
            "结束对话"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "守门人对话结束"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：用“结束对话”选择这个玩家和同一剧情预设。 试玩先打开再结束，观察消息时点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：该玩家已有对话结束时出现消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-127",
        "desktop-0-127"
      ],
      "caption": "把玩家从红队换到蓝队",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：地图中准备两个真实阵营，命名“红队”“蓝队”，让测试玩家初始属于红队。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试玩家"
            },
            "阵营变化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "玩家所属阵营改变"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：用“设置玩家阵营”把该玩家当前阵营设为蓝队。 查看所属阵营和消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：红队变为蓝队时出现事件；敌我判断、健康条和阵营染色也可能随配置变化。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-76",
        "desktop-0-76"
      ],
      "caption": "角色被击败后立即复活",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备能够被击败的测试角色，并确认玩法允许复活。 测试时关闭自动复活，便于明确由哪个动作启动复活。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "复活"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试角色已复活"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：通过正常伤害流程将角色击败。 在调试入口使用“复活角色”，目标选该角色，跳过复活时间设为真。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：角色重新复活时输出消息，首次出生不应当被用来替代这次击败后复活测试。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-68",
        "desktop-0-68"
      ],
      "caption": "选中已配置的快捷物品格",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备有可选物品格的角色；在背包或物品栏配置中确认一个目标格的真实槽位类型和索引。 给该格放入可正常选中的物品。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "指定角色",
            {
              "kind": "literal",
              "text": "角色"
            },
            "选中",
            {
              "kind": "literal",
              "text": "待选：目标格的槽位类型"
            },
            "类型的第",
            {
              "kind": "literal",
              "text": "待填：目标格的整数索引"
            },
            "物品格"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "选中了目标物品格"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：先选另一个格，再选目标格。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：选中目标类型及索引的格时出现消息；选别的格不会匹配这个监听。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "精选案例要求从背包配置核对槽位类型和索引，未指定枚举项及数值。图中两项是待选/待填槽，不能直接填提示文字，也不能猜测索引起点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：不能猜槽位索引从 0 还是 1 开始，也不能虚构槽位类型枚举。 格子事件监听槽位；同一物品移动到其他格后，应按新的槽位配置测试。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-69",
        "desktop-0-69"
      ],
      "caption": "从目标物品格切换到另一个格",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备两个可选择的物品格，记下目标格的真实类型和索引。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "指定角色",
            {
              "kind": "literal",
              "text": "角色"
            },
            "取消选中",
            {
              "kind": "literal",
              "text": "待选：目标格的槽位类型"
            },
            "类型的第",
            {
              "kind": "literal",
              "text": "待填：目标格的整数索引"
            },
            "物品格"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "取消选中了目标格"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：先选中目标格，再选择另一个格，使原目标格失去选中状态。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：目标格从选中变为取消选中时出现消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "精选案例要求从背包配置核对槽位类型和索引，未指定枚举项及数值。图中两项是待选/待填槽，不能直接填提示文字，也不能猜测索引起点。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：没有先选中目标格就操作其他格，不能证明此事件失效。 取消选中不等于移除或销毁格内物品。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-132",
        "desktop-0-132"
      ],
      "caption": "向空技能槽添加测试技能",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个可用技能预设“测试技能”，选定角色的一个真实空技能槽位并核对索引。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "技能获得"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "角色获得了技能"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：用“添加技能”依次选角色、空槽位索引和“测试技能”预设。 试玩检查槽位里出现技能与事件输出。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：测试角色获得技能后出现消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：添加到已有技能的指定槽位会覆盖旧技能，同时导致旧技能移除。 添加动作输入技能预设，移除单个技能动作通常输入技能实例。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-133",
        "desktop-0-133"
      ],
      "caption": "移除角色当前持有的测试技能",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：先让测试角色持有一个测试技能，并保存这个技能实例。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "技能失去"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "角色失去了技能"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：测试入口使用“移除技能”，参数选择保存的技能实例。 确认角色不再持有该实例。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：移除成功时出现角色失去技能事件。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：禁用技能、进入冷却与从拥有者移除技能不是同一回事。 按预设移除时，如果有多个同预设技能，官方说明只移除第一个；精确测试应使用实例。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-130",
        "desktop-0-130"
      ],
      "caption": "把角色技能从一级升到二级",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备支持至少两级的测试技能，让角色持有其一级实例。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "技能升级"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "角色的技能升级了"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：用“设置技能等级”选择这个技能实例，将当前等级设为整数 2。 检查技能实际等级与事件消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：技能从一级提升到二级时触发。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-154",
        "desktop-0-154"
      ],
      "caption": "单个技能从二级降回一级",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备允许一级和二级的技能实例，初始已处于二级。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "技能实例"
            },
            "降级"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试技能降为一级"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：使用“降低技能等级”，选择该实例，降低整数 1。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：技能等级减少至一级时输出降级消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：参数是技能，不能填写持有者角色。 不要从最低等级继续降低来演示；越界处理未在此条说明。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-158",
        "desktop-0-158"
      ],
      "caption": "连段技能切换前记录旧技能",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备已配置从技能 A 切换到技能 B 的切换规则，角色当前持有处于 A 的技能实例。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "技能 A 实例"
            },
            "被切换前"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "A 即将切换"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：对 A 使用“切换一次技能”，让它按已配置规则切换。 观察切换前消息和实际切换结果。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：A 按规则发生切换前出现消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：先配置切换规则；“切换一次技能”不会替你凭空建立 A 到 B 的关系。 此事件监听旧的指定技能被切换前；切换后的事件语义是切换成为目标指定技能后。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-159",
        "desktop-0-159"
      ],
      "caption": "连段进入下一段技能后记录",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备已有 A 到 B 的技能切换规则，并在 B 的对应监听配置中绑定其运行时技能实例。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "技能 B 实例"
            },
            "切换后"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "已经切换到 B"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：在角色当前使用 A 时对 A 执行“切换一次技能”。 核对实际进入 B 后的输出。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：发生切换成为 B 后出现消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "事件绑定切换进入的 B。若不能提前取得 B 的实例，应在对应技能预设的逻辑中建立监听；不虚构获取未来技能对象的积木。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：不能把事件永远绑定在即将离开的旧 A 上，再期望它表示进入 B。 如果当前编辑器无法在切换前取得 B 的运行时监听目标，应先在技能预设对应逻辑里建立监听，不要伪造技能对象。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-156",
        "desktop-0-156"
      ],
      "caption": "消耗一次技能使用次数后等充能恢复",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备明确配置了使用次数与充能时间的技能实例；充能时间设为便于观察的正值，例如 3 秒。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "技能实例"
            },
            "技能充能完成"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "技能完成一次充能"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：使用技能消耗一次次数，等待配置的充能恢复。 对照次数或充能显示与消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：充能完成时出现消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：普通施放冷却完成与充能恢复不同，技能必须实际具有充能机制。 不要把技能一直满次数时的等待当作一次充能完成测试。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-157",
        "desktop-0-157"
      ],
      "caption": "技能子弹命中训练靶",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备具有子弹发射逻辑的技能实例和处于射程内的有效训练靶，保证碰撞和命中关系配置正确。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "技能实例"
            },
            "技能的子弹命中目标"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试技能的子弹命中"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：先向空处发射一次，再朝训练靶发射。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：技能子弹命中目标时出现消息；单纯发射不代表已命中。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：参数是技能实例，不是简易子弹事件使用的字符串标记。 此条支持命中角色、生物或组件，不要自动扩展为任意装饰物。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-160",
        "desktop-0-160"
      ],
      "caption": "销毁一件掉落物后记录清理",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个场景中已存在的测试物品实例并保存引用。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试物品实例"
            },
            "被销毁"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "掉落物已经销毁"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：在测试入口使用“销毁物品”，选择同一个实例。 观察物品消失和消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：这件物品被销毁时输出一次检查消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-161",
        "desktop-0-161"
      ],
      "caption": "把药水堆叠数量从一改为三",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一件最大堆叠数至少为 3 的药水实例，当前堆叠数为 1。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "药水实例"
            },
            "堆叠层数变化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "药水数量改变"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：使用“设置物品当前堆叠数”，选择药水实例，将数量设为整数 3。 核对显示数量和消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：当前堆叠数从 1 变成 3 时触发。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：修改最大堆叠数与修改当前堆叠数是两种动作。 先保证 3 不超出最大值；超范围处理没有在该事件说明中定义。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-163",
        "desktop-0-163"
      ],
      "caption": "选择背包里的治疗药水",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：让测试角色持有治疗药水和另一件可选择物品，保存药水实例。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "治疗药水"
            },
            "被选中"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "选中了治疗药水"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：先选择另一件物品，再选择药水。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：药水变成选中物品时出现消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-164",
        "desktop-0-164"
      ],
      "caption": "从治疗药水切换到工具",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备药水与工具两个可选物品，先把药水设为当前选中物品。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "治疗药水"
            },
            "被取消选中"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "取消选中治疗药水"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：玩家切换选择工具，让药水退出选中状态。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：药水被取消选中时出现消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-165",
        "desktop-0-165"
      ],
      "caption": "把同一件工具换到另一个物品格",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备角色已持有的工具实例和两个合法槽位，保存这件工具实例。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "工具实例"
            },
            "槽位变化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "这件工具换了槽位"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：通过背包已有换位操作，把工具从原槽位移到另一个合法槽位。 确认持有者仍相同，槽位确实改变。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：这件工具的槽位变化时收到消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：改变选中状态不等于移动槽位。 地上物品没有被持有时，不适合用来演示此事件的槽位变化。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-167",
        "desktop-0-167"
      ],
      "caption": "玩家把手中的道具丢回场景",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备允许丢弃的测试物品，让角色持有并保存该物品实例。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试物品"
            },
            "被 角色/生物 失去"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "原持有者已失去道具"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：使用物品栏已有的丢弃操作，把它丢回场景。 核对角色不再持有，而物品可能仍存在于场景中。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：物品从持有状态被失去时出现消息。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "边界：失去物品不等于物品被销毁，不能直接把旧引用解释为必然无效。 应先确认测试物品配置允许丢弃。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-0-174",
        "desktop-0-174"
      ],
      "caption": "领取一次会刷新道具的道具箱",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备能够正常产出并被领取的道具箱，确认测试角色符合领取条件。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            {
              "kind": "literal",
              "text": "测试角色"
            },
            "获得道具箱"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                {
                  "kind": "literal",
                  "text": "测试角色获得了道具箱"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试操作：让角色按地图已有方式领取这一个道具箱，确认领取行为真正完成。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察结果：选定角色发生获得道具箱行为时出现消息。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-2",
        "desktop-1-2"
      ],
      "caption": "初始化把本局分数设为整数 0",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在变量面板创建整数变量“本局分数”，作用域选当前关卡可使用的全局或局部作用域。 本图在游戏初始化执行。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "本局分数"
                },
                " = ",
                {
                  "kind": "literal",
                  "text": "0"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-8",
        "desktop-1-8"
      ],
      "caption": "写入宝箱 A 的整数属性，再把读取得到的 3 保存到变量",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备组件“宝箱 A”，并取得其组件引用。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置对象的自定义属性",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：宝箱 A"
                },
                " 属性 ",
                {
                  "kind": "literal",
                  "text": "剩余耐久"
                },
                " = ",
                {
                  "kind": "literal",
                  "text": "3"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "观察值"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取自定义属性：整数",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "组件选择：宝箱 A"
                    },
                    " 属性 ",
                    {
                      "kind": "literal",
                      "text": "剩余耐久"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先创建并监听整数变量“观察值”；属性名称和读取类型与写入保持一致。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-11",
        "desktop-1-11"
      ],
      "caption": "给玩家 P 添加领奖标签，再在条件槽中检查",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备当前在线测试玩家的玩家引用 P；P 是玩家变量，不是字符串。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "添加标签",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 标签 ",
                {
                  "kind": "literal",
                  "text": "已领取新手奖励"
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果/否则",
                " ",
                {
                  "kind": "condition",
                  "text": "拥有标签",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "P"
                    },
                    {
                      "kind": "literal",
                      "text": "已领取新手奖励"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    " ",
                    {
                      "kind": "literal",
                      "text": "标签判断成立"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    " ",
                    {
                      "kind": "literal",
                      "text": "标签判断不成立"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "P 是已取得的玩家引用；标签并不会发放奖励，也不会自动构成永久存档。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-77",
        "desktop-1-77"
      ],
      "caption": "游戏初始化后在调试窗口输出一条文字",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：打开编辑器试玩时的调试窗口。 本图在游戏初始化执行。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                " ",
                {
                  "kind": "literal",
                  "text": "初始化已执行"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-82",
        "desktop-1-82"
      ],
      "caption": "只给玩家 P 显示 2 秒提示",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备玩家引用 P，例如界面交互事件附带的玩家；需要多人验证时再准备另一名玩家。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送提示给玩家",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 内容 ",
                {
                  "kind": "literal",
                  "text": "获得 10 积分"
                },
                " 持续 ",
                {
                  "kind": "literal",
                  "text": "2"
                },
                " 秒"
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "这段文字只是提示；本图没有增加积分动作。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-83",
        "desktop-1-83"
      ],
      "caption": "单次计时到期后向全体玩家播报",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：地图已进入试玩，至少有一名在线玩家。 本图使用单次计时事件；触发前须满足上述准备条件。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "计时器到期（单次）",
            " 经过 ",
            {
              "kind": "literal",
              "text": "3"
            },
            " 秒"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送跑马灯",
                " ",
                {
                  "kind": "literal",
                  "text": "第三回合即将开始"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "3 秒用于把精选示例中的单次计时事件具体化；触发时应已有在线玩家。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-84",
        "desktop-1-84"
      ],
      "caption": "用预设在 (2,2,0) 创建一个正常尺寸的箱子",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：先把箱子保存为组件预设“测试箱子预设”。；准备在线玩家引用 P，在空场地确认坐标 (2,2,0) 不与墙体重叠。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "创建组件",
                " ",
                {
                  "kind": "literal",
                  "text": "组件预设选择：测试箱子预设"
                },
                " 坐标 ",
                {
                  "kind": "literal",
                  "text": "坐标点 (2,2,0)"
                },
                " 旋转 ",
                {
                  "kind": "literal",
                  "text": "旋转角 (0,0,0)"
                },
                " 缩放 ",
                {
                  "kind": "literal",
                  "text": "向量 (1,1,1)"
                },
                " 所属玩家 ",
                {
                  "kind": "variable",
                  "text": "P"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "预设、坐标点、旋转角、缩放向量和玩家各接对应类型的槽。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-86",
        "desktop-1-86"
      ],
      "caption": "单次计时后删除箱子 A 及其绑定子组件",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备箱子 A 的组件引用；若有绑定子组件，确认它们也是本例要清理的对象。 本图使用单次计时事件；触发前须满足上述准备条件。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "计时器到期（单次）",
            " 经过 ",
            {
              "kind": "literal",
              "text": "3"
            },
            " 秒"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "销毁组件",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：箱子 A"
                },
                " 销毁子组件 ",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "3 秒仅将精选的“按钮或计时触发”具体化；先确认子组件也需要清理。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-90",
        "desktop-1-90"
      ],
      "caption": "初始化时给临时箱安排 5 秒后销毁",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：放置仅用于测试的组件“临时箱”，取得其组件引用。 本图在游戏初始化执行。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置定时销毁时间",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：临时箱"
                },
                " 时间 ",
                {
                  "kind": "literal",
                  "text": "5"
                },
                " 秒"
              ]
            }
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-105",
        "desktop-1-105"
      ],
      "caption": "把无运动器的测试箱传送到 (6,2,0)",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备组件“测试箱”，暂时不挂运动器，确认目标坐标 (6,2,0) 安全。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置组件坐标",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：测试箱"
                },
                " 坐标 ",
                {
                  "kind": "literal",
                  "text": "坐标点 (6,2,0)"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-109",
        "desktop-1-109"
      ],
      "caption": "隐藏测试墙；另一次触发恢复显示",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备初始开启物理碰撞的墙组件。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置组件模型显示/隐藏",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：测试墙"
                },
                " 模型显示 ",
                {
                  "kind": "literal",
                  "text": "假"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "恢复显示"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置组件模型显示/隐藏",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：测试墙"
                },
                " 模型显示 ",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察隐藏效果后，再向关卡发送“恢复显示”。隐藏模型不关闭原有碰撞。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-110",
        "desktop-1-110"
      ],
      "caption": "先关闭门的碰撞，测试穿过后再单独恢复",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备初始已开启物理碰撞的门组件；这项前提需在编辑器里确认。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置组件物理碰撞开启/关闭",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：门"
                },
                " 碰撞开启 ",
                {
                  "kind": "literal",
                  "text": "假"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "恢复碰撞"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置组件物理碰撞开启/关闭",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：门"
                },
                " 碰撞开启 ",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察穿过后再发送“恢复碰撞”。门初始必须开启物理碰撞；两条动作不能在同一次触发里立刻先关再开。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-111",
        "desktop-1-111"
      ],
      "caption": "连续两次设置绝对缩放，结果仍为 (2,1,1)",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备组件“测试箱”，当前缩放为 (1,1,1)。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置缩放大小",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：测试箱"
                },
                " 缩放 ",
                {
                  "kind": "literal",
                  "text": "向量 (2,1,1)"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置缩放大小",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：测试箱"
                },
                " 缩放 ",
                {
                  "kind": "literal",
                  "text": "向量 (2,1,1)"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-125",
        "desktop-1-126"
      ],
      "caption": "给移动台添加世界 X 方向的 3 秒直线运动",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备有运动能力、没有其他运动器叠加的组件“移动台”，留出前方空间。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "添加直线运动器",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：移动台"
                },
                " 线速度 ",
                {
                  "kind": "literal",
                  "text": "向量 (2,0,0)"
                },
                " 持续 ",
                {
                  "kind": "literal",
                  "text": "3"
                },
                " 秒 局部坐标 ",
                {
                  "kind": "literal",
                  "text": "假"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-119",
        "desktop-1-119"
      ],
      "caption": "激活移动台预置的第一个运动器",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在移动台上预置一个运动器，确认其实际序号为 0，并让它处于未运行或暂停状态。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "激活运动器",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：移动台"
                },
                " 运动器序号 ",
                {
                  "kind": "literal",
                  "text": "0"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "本图使用未运行或暂停状态的运动器；若已经完整运行结束，先重置再激活。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-120",
        "desktop-1-120"
      ],
      "caption": "暂停 0 号运动器，另一次事件恢复",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备正由预置 0 号运动器驱动的移动台。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "暂停运动器",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：移动台"
                },
                " 运动器序号 ",
                {
                  "kind": "literal",
                  "text": "0"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "恢复运动"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "激活运动器",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：移动台"
                },
                " 运动器序号 ",
                {
                  "kind": "literal",
                  "text": "0"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察停下后再向关卡发送“恢复运动”。不要在同一次触发里立刻暂停又激活。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-121",
        "desktop-1-121"
      ],
      "caption": "已结束的 0 号运动器先重置，再重新激活",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备已经执行结束的移动台 0 号运动器。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "重置运动器",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：移动台"
                },
                " 运动器序号 ",
                {
                  "kind": "literal",
                  "text": "0"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "激活运动器",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：移动台"
                },
                " 运动器序号 ",
                {
                  "kind": "literal",
                  "text": "0"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-353",
        "desktop-1-356"
      ],
      "caption": "把积分设为 20 后加 10；再单独触发扣 5",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备在线玩家 P，先用“设置玩家积分”把积分设为 20。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置玩家积分",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 积分 ",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "增加玩家积分",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 增加 ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "测试扣分"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "增加玩家积分",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 增加 ",
                {
                  "kind": "literal",
                  "text": "-5"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "第一次执行后为 30；观察后发送“测试扣分”，积分变为 25。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-326",
        "desktop-1-329"
      ],
      "caption": "把玩家 P 的金币设为 100，并读取到定点数变量",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在工坊设置→规则设置→属性规则→设置属性中添加玩家属性“金币”。；准备在线玩家引用 P。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置玩家属性",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 属性 ",
                {
                  "kind": "literal",
                  "text": "金币"
                },
                " = ",
                {
                  "kind": "literal",
                  "text": "100"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "观察金币"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取玩家属性",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "P"
                    },
                    {
                      "kind": "literal",
                      "text": "金币"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先创建并监听定点数变量“观察金币”；“金币”须在玩家属性规则中定义。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-535",
        "desktop-1-544"
      ],
      "caption": "给玩家 P 的任务文本填入收集目标",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在可见画布中创建文本控件“任务说明”，准备玩家 P。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置文本节点的内容",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 文本控件 ",
                {
                  "kind": "literal",
                  "text": "文本控件选择：任务说明"
                },
                " 内容 ",
                {
                  "kind": "literal",
                  "text": "收集 3 枚金币"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-545",
        "desktop-1-554"
      ],
      "caption": "把 0～100 血条在 0.5 秒内更新到 60",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备玩家 P 和进度条“测试血条”，最小值 0、最大值 100。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置进度条控件的当前值",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 控件 ",
                {
                  "kind": "literal",
                  "text": "进度条控件选择：测试血条"
                },
                " 当前值 ",
                {
                  "kind": "literal",
                  "text": "60"
                },
                " 过渡时间 ",
                {
                  "kind": "literal",
                  "text": "0.5"
                },
                " 秒"
              ]
            }
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-602",
        "desktop-1-611"
      ],
      "caption": "清空列表后追加 10、20，再分别读取索引 0、1",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：创建整数列表变量“分数列表”，先清空确保无旧数据。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "第一项"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "列表取值：整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "分数列表"
                    },
                    " 索引 ",
                    {
                      "kind": "literal",
                      "text": "0"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "第二项"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "列表取值：整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "分数列表"
                    },
                    " 索引 ",
                    {
                      "kind": "literal",
                      "text": "1"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "创建并监听整数变量“第一项”和“第二项”；结果分别为 10、20。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-601",
        "desktop-1-610"
      ],
      "caption": "在 [10,30] 的索引 1 插入 20",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数列表“分数列表”，依次追加 10、30，形成 [10,30]。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "30"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（插入）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 索引 ",
                {
                  "kind": "literal",
                  "text": "1"
                },
                " 插入 ",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "第一项"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "列表取值：整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "分数列表"
                    },
                    {
                      "kind": "literal",
                      "text": "0"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "第二项"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "列表取值：整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "分数列表"
                    },
                    {
                      "kind": "literal",
                      "text": "1"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "第三项"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "列表取值：整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "分数列表"
                    },
                    {
                      "kind": "literal",
                      "text": "2"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "创建并监听图中整数变量；结果依次为 10、20、30。插入会让后续索引移动。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-603",
        "desktop-1-612"
      ],
      "caption": "移除 [10,20,30] 的第二项：索引填 1",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数列表 [10,20,30]。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "30"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表移除（指定索引）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 索引 ",
                {
                  "kind": "literal",
                  "text": "1"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "列表长度"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取列表长度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "分数列表"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "第一项"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "列表取值：整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "分数列表"
                    },
                    {
                      "kind": "literal",
                      "text": "0"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "第二项"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "列表取值：整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "分数列表"
                    },
                    {
                      "kind": "literal",
                      "text": "1"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "图中观察变量均为整数；长度为 2，列表剩下 [10,30]。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-604",
        "desktop-1-613"
      ],
      "caption": "从 [10,20,10] 只移除最靠前的一个 10",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数列表 [10,20,10]。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表移除（指定元素）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "第一项"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "列表取值：整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "分数列表"
                    },
                    {
                      "kind": "literal",
                      "text": "0"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "第二项"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "列表取值：整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "分数列表"
                    },
                    {
                      "kind": "literal",
                      "text": "1"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "创建并监听第一项、第二项两个整数变量；结果为 20、10，不会移除所有 10。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-599",
        "desktop-1-608"
      ],
      "caption": "去重后只保留 10、20、30 各一个",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数列表 [10,20,10,20,30]。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "30"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表去除重复元素",
                " ",
                {
                  "kind": "variable",
                  "text": "分数列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "列表长度"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取列表长度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "分数列表"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "创建并监听整数变量“列表长度”，结果为 3。本图不依赖官方未保证的去重后顺序。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-605",
        "desktop-1-614"
      ],
      "caption": "清空后长度为 0，再添加整数 5",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数列表 [10,20,30]。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                " ",
                {
                  "kind": "variable",
                  "text": "本轮分数列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "本轮分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "本轮分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "本轮分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "30"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                " ",
                {
                  "kind": "variable",
                  "text": "本轮分数列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "清空后长度"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取列表长度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "本轮分数列表"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "本轮分数列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "5"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "创建并监听整数变量“清空后长度”；它保存 0，最后列表为 [5]。清空不会删除列表引用的场景物体。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-102",
        "desktop-1-102"
      ],
      "caption": "把装饰箱 B 绑定到平台 A：父级在第 1 槽",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备开启物理且能够移动的组件“平台 A”和另一个组件“装饰箱 B”。；两者不要已有互相形成环路的父级绑定；将 B 放在容易观察的相对位置。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "添加绑定",
                " ",
                " 父级 ",
                {
                  "kind": "literal",
                  "text": "组件选择：平台 A"
                },
                " 子级 ",
                {
                  "kind": "literal",
                  "text": "组件选择：装饰箱 B"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "然后通过平台 A 已配置的运动器驱动它；A、B 必须是不同组件，B 将跟随 A。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-606",
        "desktop-1-615"
      ],
      "caption": "整数奖池加入 10 和 20，权重为 1 与 3",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：创建整数权重池变量“金币奖池”，开始时为空。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "权重池添加元素",
                " ",
                {
                  "kind": "variable",
                  "text": "金币奖池"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "10"
                },
                " 权重 ",
                {
                  "kind": "literal",
                  "text": "1"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "权重池添加元素",
                " ",
                {
                  "kind": "variable",
                  "text": "金币奖池"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "20"
                },
                " 权重 ",
                {
                  "kind": "literal",
                  "text": "3"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "抽取结果"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "权重池中随机取一个值:整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "金币奖池"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先创建并监听整数变量“抽取结果”；多次抽取不保证短期次数严格符合 1:3。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-327",
        "desktop-1-330"
      ],
      "caption": "金币属性先设 20，再增加 10，读取结果为 30",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在工坊设置→规则设置→属性规则→设置属性中创建玩家属性“金币”。；准备在线玩家 P，先用设置玩家属性把其金币设为 20。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置玩家属性",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 属性 ",
                {
                  "kind": "literal",
                  "text": "金币"
                },
                " = ",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "增加玩家属性",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 属性 ",
                {
                  "kind": "literal",
                  "text": "金币"
                },
                " 增加 ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "观察金币"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取玩家属性",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "P"
                    },
                    {
                      "kind": "literal",
                      "text": "金币"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先创建并监听定点数变量“观察金币”；玩家属性“金币”应已在规则中定义。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-387",
        "desktop-4-387"
      ],
      "caption": "把整数乘法嵌进赋值槽：总金币 = 7 × 3",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：新建整数变量“总金币”，开启监听。 本图在游戏初始化执行。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "总金币"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "整数运算(+-×÷)",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "7"
                    },
                    {
                      "kind": "literal",
                      "text": "×"
                    },
                    {
                      "kind": "literal",
                      "text": "3"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "7 和 3 是整数；× 是运算符选择项，结果为 21。取值积木没有独立动作连接口。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-437",
        "desktop-4-437"
      ],
      "caption": "先查找 20 的索引，再用这个索引读取列表",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数列表 [10,20,30]。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                " ",
                {
                  "kind": "variable",
                  "text": "整数样本列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "整数样本列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "整数样本列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "整数样本列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "30"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "找到的索引"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "列表中指定元素的索引",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "整数样本列表"
                    },
                    " 元素 ",
                    {
                      "kind": "literal",
                      "text": "20"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "取出整数"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "列表取值：整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "整数样本列表"
                    },
                    " 索引 ",
                    {
                      "kind": "variable",
                      "text": "找到的索引"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先创建两个整数观察变量；查找结果索引为 1，读取结果为 20。本例确保列表含有 20。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-978",
        "desktop-4-978"
      ],
      "caption": "重复字符串也占位置：[甲,乙,甲] 的长度为 3",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备字符串列表 [“甲”,“乙”,“甲”]。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                " ",
                {
                  "kind": "variable",
                  "text": "字符串样本列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "字符串样本列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "甲"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "字符串样本列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "乙"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                " ",
                {
                  "kind": "variable",
                  "text": "字符串样本列表"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "甲"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "列表长度"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取列表长度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "字符串样本列表"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "新建字符串列表“字符串样本列表”与整数观察变量“列表长度”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-441",
        "desktop-4-441"
      ],
      "caption": "读取宝箱已写入的整数属性“剩余金币”",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备存在的组件“宝箱”。；先给宝箱设置整数自定义属性“剩余金币”=20。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置对象的自定义属性",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：宝箱"
                },
                " 属性 ",
                {
                  "kind": "literal",
                  "text": "剩余金币"
                },
                " = ",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "剩余金币读数"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取自定义属性：整数",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "组件选择：宝箱"
                    },
                    {
                      "kind": "literal",
                      "text": "剩余金币"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先创建并监听整数变量“剩余金币读数”；结果为 20。读取名称和类型都要与写入一致。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-547",
        "desktop-4-547"
      ],
      "caption": "玩家金币写为 12，再嵌入取值积木读回",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在“工坊设置→规则设置→属性规则→设置属性”创建玩家属性“金币”。；取得当前在线玩家 P；先用“设置玩家属性”将 P 的“金币”设为定点数 12。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置玩家属性",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 属性 ",
                {
                  "kind": "literal",
                  "text": "金币"
                },
                " = ",
                {
                  "kind": "literal",
                  "text": "12"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "观察金币"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取玩家属性",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "P"
                    },
                    {
                      "kind": "literal",
                      "text": "金币"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先创建并监听定点数变量“观察金币”；读取的是同一玩家 P。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-1",
        "desktop-2-1"
      ],
      "caption": "同一个奖励箱，两个标签判断分别为真和假",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：给组件“奖励箱”添加标签“可拾取”。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "添加标签",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：奖励箱"
                },
                " 标签 ",
                {
                  "kind": "literal",
                  "text": "可拾取"
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果/否则",
                " ",
                {
                  "kind": "condition",
                  "text": "拥有标签",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "组件选择：奖励箱"
                    },
                    {
                      "kind": "literal",
                      "text": "可拾取"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    " ",
                    {
                      "kind": "literal",
                      "text": "可拾取：真"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    " ",
                    {
                      "kind": "literal",
                      "text": "可拾取：假"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果/否则",
                " ",
                {
                  "kind": "condition",
                  "text": "拥有标签",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "组件选择：奖励箱"
                    },
                    {
                      "kind": "literal",
                      "text": "已打开"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    " ",
                    {
                      "kind": "literal",
                      "text": "已打开：真"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    " ",
                    {
                      "kind": "literal",
                      "text": "已打开：假"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "不要预先添加“已打开”标签。两次判断各接入自己的如果/否则条件槽。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-5",
        "desktop-2-5"
      ],
      "caption": "金币为 10 时，把“金币 ≥ 5”嵌入条件槽",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数“金币”=10。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "金币"
                },
                " = ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果/否则",
                " ",
                {
                  "kind": "condition",
                  "text": "比较",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "金币"
                    },
                    {
                      "kind": "literal",
                      "text": "≥"
                    },
                    {
                      "kind": "literal",
                      "text": "5"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    " ",
                    {
                      "kind": "literal",
                      "text": "条件成立"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    " ",
                    {
                      "kind": "literal",
                      "text": "条件不成立"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "≥ 为编辑器数值比较符的对应选项。此例使用整数变量金币，与玩家自定义金币属性不同。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-6",
        "desktop-2-6"
      ],
      "caption": "先判断组件 C 存在，只在真分支读取位置",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个场景中仍存在的组件 C。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "如果/否则",
                " ",
                {
                  "kind": "condition",
                  "text": "对象存在",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "组件选择：C"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "设置变量",
                    " ",
                    {
                      "kind": "variable",
                      "text": "组件位置"
                    },
                    " = ",
                    {
                      "kind": "value",
                      "text": "获取组件位置",
                      "parts": [
                        {
                          "kind": "literal",
                          "text": "组件选择：C"
                        }
                      ]
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    " ",
                    {
                      "kind": "literal",
                      "text": "组件 C 不存在"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先创建并监听坐标点变量“组件位置”；假分支不读取已失效对象。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-7",
        "desktop-2-7"
      ],
      "caption": "先判断属性存在，再读取整数金币",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备组件 C，预先设置整数自定义属性“金币”=20。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置对象的自定义属性",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：C"
                },
                " 属性 ",
                {
                  "kind": "literal",
                  "text": "金币"
                },
                " = ",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果/否则",
                " ",
                {
                  "kind": "condition",
                  "text": "自定义属性存在",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "组件选择：C"
                    },
                    {
                      "kind": "literal",
                      "text": "金币"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "设置变量",
                    " ",
                    {
                      "kind": "variable",
                      "text": "金币读数"
                    },
                    " = ",
                    {
                      "kind": "value",
                      "text": "获取自定义属性：整数",
                      "parts": [
                        {
                          "kind": "literal",
                          "text": "组件选择：C"
                        },
                        {
                          "kind": "literal",
                          "text": "金币"
                        }
                      ]
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    " ",
                    {
                      "kind": "literal",
                      "text": "金币属性不存在"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先创建并监听整数变量“金币读数”，结果为 20。存在判断不替代类型匹配。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-41",
        "desktop-2-41"
      ],
      "caption": "玩家 P 的在线判断嵌在如果/否则中",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备当前确认在线的玩家 P。 对象和数据准备完成后，向关卡发送自定义事件“运行示例”，再执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "如果/否则",
                " ",
                {
                  "kind": "condition",
                  "text": "判断玩家是否在线",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "P"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    " ",
                    {
                      "kind": "literal",
                      "text": "玩家 P 在线"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    " ",
                    {
                      "kind": "literal",
                      "text": "玩家 P 不在线"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-3",
        "desktop-1-3"
      ],
      "caption": "经过 3 秒发送“打开测试门”，由全局事件接收",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：放置无运动器的组件“测试门”，准备它的组件引用。；在关卡中建立“接收自定义事件（全局）”，事件字符串填“打开测试门”，其动作把测试门模型显示设为假。 按图中单次计时事件执行。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "计时器到期（单次）",
            " 经过 ",
            {
              "kind": "literal",
              "text": "3"
            },
            " 秒"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送自定义事件",
                " ",
                {
                  "kind": "literal",
                  "text": "打开测试门"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "打开测试门"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置组件模型显示/隐藏",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：测试门"
                },
                " 模型显示 ",
                {
                  "kind": "literal",
                  "text": "假"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "发送与接收的事件名必须完全一致。门隐藏后，原碰撞仍然保留。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-5",
        "desktop-1-5"
      ],
      "caption": "给门 A 单独发“开门”，同预设门 B 不响应",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备同一预设的门 A、门 B 两个组件。；在该预设画布中用“接收自定义事件（当前对象）”监听“开门”，动作操作当前对象。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送自定义事件（指定对象）",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：门 A"
                },
                " 事件 ",
                {
                  "kind": "literal",
                  "text": "开门"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "下面的接收事件放在门预设画布中；本图用调试信息观察收到事件，门的实际响应动作沿用预设配置。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（当前对象）",
            " ",
            {
              "kind": "literal",
              "text": "开门"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                " ",
                {
                  "kind": "literal",
                  "text": "当前对象收到开门"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "门 A、门 B 是两个不同实例。接收端使用“当前对象”，不是关卡广播接收。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-103",
        "desktop-1-103"
      ],
      "caption": "复制箱子 A 到 (4,2,0)，原箱子仍保留",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备已有组件“箱子 A”及在线玩家引用 P。；留出坐标 (4,2,0) 供副本出现。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "复制组件",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：箱子 A"
                },
                " 坐标 ",
                {
                  "kind": "literal",
                  "text": "坐标点 (4,2,0)"
                },
                " 旋转 ",
                {
                  "kind": "literal",
                  "text": "旋转角 (0,0,0)"
                },
                " 所属玩家 ",
                {
                  "kind": "variable",
                  "text": "P"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "P 是已取得的在线玩家变量。第 1 槽接组件实例，不是组件预设。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-112",
        "desktop-1-112"
      ],
      "caption": "每次触发都在当前缩放上乘 (2,1,1)",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备缩放为 (1,1,1) 的组件；取消该组件的性能优化勾选。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "修改缩放大小",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：测试箱"
                },
                " 倍率 ",
                {
                  "kind": "literal",
                  "text": "向量 (2,1,1)"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "复原缩放"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置缩放大小",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：测试箱"
                },
                " 缩放 ",
                {
                  "kind": "literal",
                  "text": "向量 (1,1,1)"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "初始缩放为 (1,1,1)。发一次“运行示例”后 X 为 2，观察后再发一次变为 4；发送“复原缩放”可复原。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-99",
        "desktop-1-99"
      ],
      "caption": "先把箱子健康值设为 50，观察后再测试 0 值销毁",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在编辑器中先开启箱子的健康值，最大健康值设为 100。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置组件当前健康值",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：箱子"
                },
                " 当前健康值 ",
                {
                  "kind": "literal",
                  "text": "50"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "健康值读数"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取组件当前健康值",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "组件选择：箱子"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "测试零健康值"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置组件当前健康值",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：箱子"
                },
                " 当前健康值 ",
                {
                  "kind": "literal",
                  "text": "0"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "新建并监听定点数变量“健康值读数”。观察 50 后再发送“测试零健康值”；归零会删除箱子，不在删除后继续取值。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-88",
        "desktop-1-88"
      ],
      "caption": "移动台加速 2 秒，再匀速 1 秒",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：组件必须是非受力、非静态物理的运动组件；为测试清除其他运动器影响。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "添加变速直线运动（非受力）",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：移动台"
                },
                " 初速度 ",
                {
                  "kind": "literal",
                  "text": "向量 (1,0,0)"
                },
                " 加速度 ",
                {
                  "kind": "literal",
                  "text": "向量 (1,0,0)"
                },
                " 加速时间 ",
                {
                  "kind": "literal",
                  "text": "2"
                },
                " 匀速时间 ",
                {
                  "kind": "literal",
                  "text": "1"
                },
                " 局部坐标 ",
                {
                  "kind": "literal",
                  "text": "假"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "本例只添加一次。目标须为非受力、非静态物理的运动组件；最长持续 3 秒。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "desktop-1-122"
      ],
      "caption": "把平台 A 的预置运动器复制到平台 B",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：平台 A 在编辑器中预置一组运动器，平台 B 已有一个待替换的运动器。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "复制运动器",
                " ",
                " 目标 ",
                {
                  "kind": "literal",
                  "text": "组件选择：平台 B"
                },
                " 来源 ",
                {
                  "kind": "literal",
                  "text": "组件选择：平台 A"
                },
                " 覆盖原有运动器 ",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "第 1 槽是目标 B，第 2 槽是来源 A；不复制蛋码动态添加的运动器。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-171",
        "desktop-1-172"
      ],
      "caption": "伤害机关对训练靶造成 10 点伤害",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：放置启用健康规则的生物“训练靶”，初始健康值 100，无额外减伤或治疗逻辑。；准备伤害来源组件“伤害机关”，并接入训练靶受到伤害事件以输出调试信息。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "造成伤害",
                " ",
                {
                  "kind": "literal",
                  "text": "角色/生物选择：训练靶"
                },
                " 伤害 ",
                {
                  "kind": "literal",
                  "text": "10"
                },
                " 来源 ",
                {
                  "kind": "literal",
                  "text": "组件选择：伤害机关"
                },
                " 显示模式 ",
                {
                  "kind": "literal",
                  "text": "在编辑器选择实际飘字显示选项"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "指定角色/生物受到伤害后",
            " ",
            {
              "kind": "literal",
              "text": "角色/生物选择：训练靶"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                " ",
                {
                  "kind": "literal",
                  "text": "训练靶受到伤害"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "健康值读数"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取当前健康值",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "角色/生物选择：训练靶"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "新建并监听定点数变量“健康值读数”；无其他规则修正时由 100 变为 90。显示模式是枚举，不能替换成真/假。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-140",
        "desktop-1-141"
      ],
      "caption": "治疗者给训练靶治疗 20，健康值由 60 到 80",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备最大健康值 100、当前健康值 60 的生物“训练靶”和另一个生物“治疗者”。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "治疗健康值",
                " ",
                {
                  "kind": "literal",
                  "text": "角色/生物选择：训练靶"
                },
                " 治疗量 ",
                {
                  "kind": "literal",
                  "text": "20"
                },
                " 来源 ",
                {
                  "kind": "literal",
                  "text": "角色/生物选择：治疗者"
                },
                " 是否飘字 ",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "健康值读数"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取当前健康值",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "角色/生物选择：训练靶"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "新建并监听定点数变量“健康值读数”。目标最大健康值为 100；这里的飘字参数确实是布尔值。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-166",
        "desktop-1-167"
      ],
      "caption": "删除测试召唤物及绑定子组件",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备临时生物引用“测试召唤物”，其绑定子组件也都是临时内容。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "销毁角色/生物",
                " ",
                {
                  "kind": "literal",
                  "text": "角色/生物选择：测试召唤物"
                },
                " 同时销毁绑定子组件 ",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "测试召唤物必须是生物；本动作不能删除玩家角色。删除与击败的事件流程不同。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-231",
        "desktop-1-234"
      ],
      "caption": "从玩家 P 取得角色 R，存在时传送到 (0,3,0)",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备在线玩家 P，用“获取玩家控制角色”取得角色 R；确认返回值非空。；确认坐标点 (0,3,0) 位于安全空旷位置。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "R"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取玩家控制角色",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "P"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果/否则",
                " ",
                {
                  "kind": "condition",
                  "text": "对象存在",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "R"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "设置角色坐标",
                    " ",
                    {
                      "kind": "variable",
                      "text": "R"
                    },
                    " 坐标 ",
                    {
                      "kind": "literal",
                      "text": "坐标点 (0,3,0)"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    " ",
                    {
                      "kind": "literal",
                      "text": "玩家当前没有可用角色"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "P 是玩家变量，R 是角色蛋仔变量；角色参数接 R，不接 P。图中存在判断落实原精选的“确认非空”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-230",
        "desktop-1-233"
      ],
      "caption": "已被击败的角色 R 跳过等待，开始复活",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备当前玩家控制的角色 R，并在测试流程中让 R 已进入被击败状态。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "复活角色",
                " ",
                {
                  "kind": "variable",
                  "text": "R"
                },
                " 跳过复活时间 ",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "R 是原先取得的角色蛋仔引用。先让它进入被击败状态；复活位置由地图复活规则决定。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-236",
        "desktop-1-239"
      ],
      "caption": "将角色 R 的自动复活等待设置为 3 秒",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备角色 R，开启其自动复活，保证测试时有可用于复活的命数。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置角色复活时间",
                " ",
                {
                  "kind": "variable",
                  "text": "R"
                },
                " 复活时间 ",
                {
                  "kind": "literal",
                  "text": "3"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "设置之后，通过原测试逻辑击败 R 并计时。设置时间本身不启用自动复活；自动复活与命数须已准备好。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-218",
        "desktop-1-221"
      ],
      "caption": "选择实际移动速度属性，将数值设为 10",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备在线玩家控制的角色 R，并记录原移动属性以便恢复。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置移动属性",
                " ",
                {
                  "kind": "variable",
                  "text": "R"
                },
                " 移动属性 ",
                {
                  "kind": "literal",
                  "text": "在编辑器选移动速度对应项"
                },
                " 数值 ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "原精选未给出枚举编码，因此图中不猜测数字。记录原值，以便测试后恢复；移动速度上限为 30。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-246",
        "desktop-1-249"
      ],
      "caption": "在 (3,2,0) 创建训练 NPC",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：先保存生物预设“训练NPC预设”，准备玩家引用 P。；确认坐标 (3,2,0) 可容纳生物。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "创建生物",
                " ",
                {
                  "kind": "literal",
                  "text": "生物预设选择：训练NPC预设"
                },
                " 坐标 ",
                {
                  "kind": "literal",
                  "text": "坐标点 (3,2,0)"
                },
                " 所属玩家 ",
                {
                  "kind": "variable",
                  "text": "P"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "P 是在线玩家变量。本图只使用此条公开列出的三个参数，未补造旋转和缩放插槽。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-281",
        "desktop-1-284"
      ],
      "caption": "创建正常缩放的测试传送门逻辑体",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：保存可用的逻辑体预设“测试传送门预设”，准备玩家 P。；在坐标 (5,2,0) 留出空间。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "创建逻辑体",
                " ",
                {
                  "kind": "literal",
                  "text": "逻辑体预设选择：测试传送门预设"
                },
                " 坐标 ",
                {
                  "kind": "literal",
                  "text": "坐标点 (5,2,0)"
                },
                " 旋转 ",
                {
                  "kind": "literal",
                  "text": "旋转角 (0,0,0)"
                },
                " 缩放 ",
                {
                  "kind": "literal",
                  "text": "向量 (1,1,1)"
                },
                " 所属玩家 ",
                {
                  "kind": "variable",
                  "text": "P"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-286",
        "desktop-1-289"
      ],
      "caption": "设置传送门出口为 (10,3,0)，随机半径为 0",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备实际类型为传送门的逻辑体“测试门”，确认目标坐标 (10,3,0) 安全。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置传送门传送坐标",
                " ",
                {
                  "kind": "literal",
                  "text": "逻辑体选择：测试门"
                },
                " 传送坐标 ",
                {
                  "kind": "literal",
                  "text": "坐标点 (10,3,0)"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置传送门传送随机半径",
                " ",
                {
                  "kind": "literal",
                  "text": "逻辑体选择：测试门"
                },
                " 随机半径 ",
                {
                  "kind": "literal",
                  "text": "0"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "执行后让角色进入测试门。这里改的是出口，不是门本体位置；目标必须是传送门。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-289",
        "desktop-1-292"
      ],
      "caption": "把光源逻辑体“测试灯”的亮度设为 2",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备真正的光源逻辑体“测试灯”，置于容易看出光照变化的位置。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置光源亮度",
                " ",
                {
                  "kind": "literal",
                  "text": "逻辑体选择：测试灯"
                },
                " 亮度 ",
                {
                  "kind": "literal",
                  "text": "2"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先记录编辑器里的原亮度；复原时填回记录值。2 是本例测试值，不是官方上限。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-282",
        "desktop-1-285"
      ],
      "caption": "回收临时传送门及其绑定子组件",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备临时传送门逻辑体引用，确认它和绑定子组件均不再需要。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "销毁逻辑体",
                " ",
                {
                  "kind": "literal",
                  "text": "逻辑体选择：临时传送门"
                },
                " 销毁子组件 ",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "删除之后不要再用这个旧引用设置出口或位置。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-330",
        "desktop-1-333"
      ],
      "caption": "将玩家 P 的整数游玩进度“最高到达层”写为 3",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在游玩进度→自定义中创建整数类型进度“最高到达层”。；准备玩家 P，并在游玩进度参数选择器里找到刚创建的进度对象。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置整数类型游玩进度",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 游玩进度 ",
                {
                  "kind": "literal",
                  "text": "游玩进度选择：最高到达层"
                },
                " 值 ",
                {
                  "kind": "literal",
                  "text": "3"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "进度读数"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取整数类型游玩进度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "P"
                    },
                    {
                      "kind": "literal",
                      "text": "游玩进度选择：最高到达层"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "新建并监听整数变量“进度读数”。本图验证写后读取；跨局保存需按实际环境另外测试。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-527",
        "desktop-1-536"
      ],
      "caption": "为玩家 P 打开任务面板，之后单独关闭",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在界面编辑器创建画布“任务面板”，初始隐藏，添加一个可辨识的标题。；准备在线玩家 P 和该画布控件引用。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置画布可见性",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 画布 ",
                {
                  "kind": "literal",
                  "text": "画布控件选择：任务面板"
                },
                " 可见 ",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "关闭任务面板"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置画布可见性",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 画布 ",
                {
                  "kind": "literal",
                  "text": "画布控件选择：任务面板"
                },
                " 可见 ",
                {
                  "kind": "literal",
                  "text": "假"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "查看面板后再发送“关闭任务面板”；只有指定玩家 P 的界面受影响。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-537",
        "desktop-1-546"
      ],
      "caption": "将任务标题字号变为 24，变化时间 0.5 秒",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备玩家 P 和可见文本控件“任务标题”。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置文本控件的字号",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 控件 ",
                {
                  "kind": "literal",
                  "text": "文本控件选择：任务标题"
                },
                " 字号 ",
                {
                  "kind": "literal",
                  "text": "24"
                },
                " 变化时间 ",
                {
                  "kind": "literal",
                  "text": "0.5"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "检查文字是否挤出控件范围。字号是整数，变化时间为定点数。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-540",
        "desktop-1-549"
      ],
      "caption": "上限设为 100；先看 60，再单独测试超上限 120",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备玩家 P 和可见进度条控件“测试血条”，最小值先设为 0。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置进度条控件的最大值",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 控件 ",
                {
                  "kind": "literal",
                  "text": "进度条控件选择：测试血条"
                },
                " 最大值 ",
                {
                  "kind": "literal",
                  "text": "100"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置进度条控件的当前值",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 控件 ",
                {
                  "kind": "literal",
                  "text": "进度条控件选择：测试血条"
                },
                " 当前值 ",
                {
                  "kind": "literal",
                  "text": "60"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "测试进度上限"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置进度条控件的当前值",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 控件 ",
                {
                  "kind": "literal",
                  "text": "进度条控件选择：测试血条"
                },
                " 当前值 ",
                {
                  "kind": "literal",
                  "text": "120"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "查看 60/100 后再发送“测试进度上限”，120 会修正为 100。原精选未指定可选过渡时间，此处不另填示例时间。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-546",
        "desktop-1-555"
      ],
      "caption": "将开始按钮文字改为“开始挑战”",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备玩家 P 和按钮控件“开始按钮”，确认其所在画布可见。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置按钮控件的文本",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 按钮 ",
                {
                  "kind": "literal",
                  "text": "按钮控件选择：开始按钮"
                },
                " 文本 ",
                {
                  "kind": "literal",
                  "text": "开始挑战"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "这只修改按钮文字，不自动添加点击事件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-550",
        "desktop-1-559"
      ],
      "caption": "关闭提交按钮交互，测试后单独恢复",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备玩家 P 和按钮“提交按钮”，已为它配置点击事件用于输出调试信息。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置控件的交互开关",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 控件 ",
                {
                  "kind": "literal",
                  "text": "界面控件选择：提交按钮"
                },
                " 交互开关 ",
                {
                  "kind": "literal",
                  "text": "假"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "恢复提交按钮"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置控件的交互开关",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 控件 ",
                {
                  "kind": "literal",
                  "text": "界面控件选择：提交按钮"
                },
                " 交互开关 ",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "尝试点击并检查原点击事件日志；随后发送“恢复提交按钮”。交互关闭不会隐藏控件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-455",
        "desktop-1-464"
      ],
      "caption": "在 (2,2,2) 生成一件测试钥匙",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：保存可用物品预设“测试钥匙”，确认坐标 (2,2,2) 是安全生成点。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "创建物品到坐标点",
                " ",
                {
                  "kind": "literal",
                  "text": "物品预设选择：测试钥匙"
                },
                " 坐标 ",
                {
                  "kind": "literal",
                  "text": "坐标点 (2,2,2)"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "执行后走到该点观察、拾取。它还没有直接进入玩家背包。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-456",
        "desktop-1-465"
      ],
      "caption": "给角色 R 创建一件测试钥匙",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备在线玩家 P，取得其角色 R，准备物品预设“测试钥匙”；先留出背包空间。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "创建物品给角色/生物",
                " ",
                " 角色 ",
                {
                  "kind": "variable",
                  "text": "R"
                },
                " 物品预设 ",
                {
                  "kind": "literal",
                  "text": "物品预设选择：测试钥匙"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先从玩家 P 取得角色 R 并留出背包空间。第 1 参数是角色，第 2 参数才是预设。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-457",
        "desktop-1-466"
      ],
      "caption": "在角色 R 的实际目标槽位类型创建测试药水",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备角色 R、物品预设“测试药水”，在编辑器确认可容纳该物品的实际槽位类型。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "创建物品到槽位",
                " ",
                {
                  "kind": "variable",
                  "text": "R"
                },
                " 物品预设 ",
                {
                  "kind": "literal",
                  "text": "物品预设选择：测试药水"
                },
                " 槽位类型 ",
                {
                  "kind": "literal",
                  "text": "在编辑器选可容纳药水的实际类型"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先有空位时触发；另在隔离测试中填满再触发同一流程。目标类型满会尝试另一类型，全满则掉到地上；这里不填具体槽位序号。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-460",
        "desktop-1-469"
      ],
      "caption": "从 3 把钥匙中消耗 2，把同一实验再执行一次",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备角色 R，持有测试钥匙预设对应的普通堆叠物品共 3 个。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "角色/生物消耗物品",
                " ",
                {
                  "kind": "variable",
                  "text": "R"
                },
                " 物品预设 ",
                {
                  "kind": "literal",
                  "text": "物品预设选择：测试钥匙"
                },
                " 数量 ",
                {
                  "kind": "literal",
                  "text": "2"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "首次发送“运行示例”后剩 1 个；观察后再发送一次，因为不足 2 个而不消耗。不要每次触发都重新补到 3 个。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-466",
        "desktop-1-475"
      ],
      "caption": "把木材 A 的堆叠数设为 5，并读回确认",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备普通堆叠型物品实例“木材 A”，最大堆叠数配置为至少 10。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置物品当前堆叠数",
                " ",
                {
                  "kind": "literal",
                  "text": "物品选择：木材 A"
                },
                " 当前堆叠数 ",
                {
                  "kind": "literal",
                  "text": "5"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "堆叠读数"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取物品当前堆叠层数",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "物品选择：木材 A"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先创建并监听整数变量“堆叠读数”。接具体物品实例；其最大堆叠数应至少为 10。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-470",
        "desktop-1-479"
      ],
      "caption": "删除地面上的那一件测试钥匙",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备地面上测试钥匙的物品实例引用，确认不是玩家要保留的物品。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "销毁物品",
                " ",
                {
                  "kind": "literal",
                  "text": "物品选择：测试钥匙实例"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "这里选择物品实例，不是测试钥匙预设；删除后不再继续修改它。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-483",
        "desktop-1-492"
      ],
      "caption": "将测试商店药水的剩余库存设为 5",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：创建测试商店并加入物品预设“测试药水”，先将该商品最大库存设为 10。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置物品商店物品剩余库存",
                " ",
                {
                  "kind": "literal",
                  "text": "商店选择：测试商店"
                },
                " 商品 ",
                {
                  "kind": "literal",
                  "text": "物品预设选择：测试药水"
                },
                " 剩余库存 ",
                {
                  "kind": "literal",
                  "text": "5"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "库存读数"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "获取物品商店物品当前库存",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "商店选择：测试商店"
                    },
                    {
                      "kind": "literal",
                      "text": "物品预设选择：测试药水"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先创建并监听整数变量“库存读数”。最大库存已设为 10；也可打开商店核对显示。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-485",
        "desktop-1-494"
      ],
      "caption": "让测试药水售价为 20 点“金币”属性",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在玩家属性规则中定义“金币”，准备玩家 P 且金币足够。；测试商店已加入测试药水预设，并有库存且已上架。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置物品商店物品售价",
                " ",
                {
                  "kind": "literal",
                  "text": "商店选择：测试商店"
                },
                " 商品 ",
                {
                  "kind": "literal",
                  "text": "物品预设选择：测试药水"
                },
                " 支付属性 ",
                {
                  "kind": "literal",
                  "text": "金币"
                },
                " 售价 ",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "执行后打开商店核对，再在测试环境购买观察扣减。“金币”是已定义的玩家属性名。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-27",
        "desktop-1-27"
      ],
      "caption": "初始化暂停地图时刻流逝，观察后再恢复",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在地图设置中准备可观察时刻变化的天空环境。 在游戏初始化执行本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "开关时刻流逝",
                " ",
                " 自动流逝 ",
                {
                  "kind": "literal",
                  "text": "假"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "恢复时刻流逝"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "开关时刻流逝",
                " ",
                " 自动流逝 ",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察天空时刻保持后，再向关卡发送“恢复时刻流逝”。此动作不会暂停所有游戏逻辑。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-42",
        "desktop-1-42"
      ],
      "caption": "先为玩家 P 设置胜利，需要退出本局时再结束游戏",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备胜利玩家 P；本例只在测试局最后执行。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置玩家游戏胜利",
                " ",
                {
                  "kind": "variable",
                  "text": "P"
                },
                " 展示界面 ",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "结束测试局"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置游戏结束",
                " "
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "在本局最后执行胜利流程；确认胜负设置完毕后，确需退出时再发送“结束测试局”。胜利动作本身不自动结束游戏。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-489",
        "desktop-1-498"
      ],
      "caption": "每秒播报；3 秒后禁用该触发器",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：创建触发器“每秒播报”，事件为每 1 秒循环计时，动作发送信息“仍在监听”。；另建经过 3 秒的单次触发器。 按图中单次计时事件执行。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "把下面循环事件所在的触发器命名为“每秒播报”。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "计时器到期（循环）",
            " 每经过 ",
            {
              "kind": "literal",
              "text": "1"
            },
            " 秒"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "发送信息",
                " ",
                {
                  "kind": "literal",
                  "text": "仍在监听"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "计时器到期（单次）",
            " 经过 ",
            {
              "kind": "literal",
              "text": "3"
            },
            " 秒"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "禁用触发器",
                " ",
                {
                  "kind": "literal",
                  "text": "触发器选择：每秒播报"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "禁用只停止后续事件监听，不中断已经开始运行的动作链。3 秒边界附近的当次回调按实际执行顺序观察。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-104",
        "desktop-1-104"
      ],
      "caption": "解除装饰箱 B 对平台 A 的父级绑定",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：先准备两个不同组件平台 A、装饰箱 B，并已将 B 绑定到 A。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除绑定",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：装饰箱 B"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "执行后再驱动平台 A 比较。目标应为子级 B；传父级 A 不会自动解除全部子级。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-38",
        "desktop-1-38"
      ],
      "caption": "关闭组件 A 与 B 之间的碰撞，测试后恢复",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备初始均开启物理碰撞的组件 A、组件 B，其中至少一个在测试中可运动。；安排一条能让两者接触的短运动路径，先确认开启时能观察到阻挡。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置物体与物体间是否能发生碰撞",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：A"
                },
                " 和 ",
                {
                  "kind": "literal",
                  "text": "组件选择：B"
                },
                " 碰撞开关 ",
                {
                  "kind": "literal",
                  "text": "假"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "恢复物体间碰撞"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置物体与物体间是否能发生碰撞",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：A"
                },
                " 和 ",
                {
                  "kind": "literal",
                  "text": "组件选择：B"
                },
                " 碰撞开关 ",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "按原短路径让两者接触，观察后再发送“恢复物体间碰撞”。A、B 是不同且初始开启碰撞的组件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-607",
        "desktop-1-616"
      ],
      "caption": "从整数金币奖池移除元素 10，随后只能抽到 20",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数权重池“金币奖池”，先添加整数 10（权重1）和20（权重3）。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "权重池移除元素",
                " ",
                {
                  "kind": "variable",
                  "text": "金币奖池"
                },
                " 元素 ",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                " ",
                {
                  "kind": "variable",
                  "text": "抽取结果"
                },
                " = ",
                {
                  "kind": "value",
                  "text": "权重池中随机取一个值:整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "金币奖池"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "金币奖池是整数权重池；预先只有 10（权重1）和 20（权重3）。新建并监听整数变量“抽取结果”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-318",
        "desktop-1-321"
      ],
      "caption": "把测试触发区域的绝对缩放设为 (2,2,2)",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备缩放为 (1,1,1) 的测试触发区域；附近留出空间，并监听其进入事件。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置缩放大小",
                " ",
                {
                  "kind": "literal",
                  "text": "触发区域选择：测试触发区域"
                },
                " 缩放 ",
                {
                  "kind": "literal",
                  "text": "向量 (2,2,2)"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "执行后从区域外进入，比较边界位置；重复设置同一绝对值不会继续翻倍。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-319",
        "desktop-1-322"
      ],
      "caption": "触发区域三轴各乘 2；复原时使用绝对缩放",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备缩放为 (1,1,1) 的测试触发区域，确认扩大后不影响无关区域。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "修改缩放大小",
                " ",
                {
                  "kind": "literal",
                  "text": "触发区域选择：测试触发区域"
                },
                " 倍率 ",
                {
                  "kind": "literal",
                  "text": "向量 (2,2,2)"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "复原区域缩放"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置缩放大小",
                " ",
                {
                  "kind": "literal",
                  "text": "触发区域选择：测试触发区域"
                },
                " 缩放 ",
                {
                  "kind": "literal",
                  "text": "向量 (1,1,1)"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "原例要求只执行一次乘算；测试后发送“复原区域缩放”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-303",
        "desktop-1-306"
      ],
      "caption": "把测试逻辑体缩放设为 (2,2,2)",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个可观察模型的测试逻辑体，当前缩放为 (1,1,1)。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置缩放大小",
                " ",
                {
                  "kind": "literal",
                  "text": "逻辑体选择：测试逻辑体"
                },
                " 缩放 ",
                {
                  "kind": "literal",
                  "text": "向量 (2,2,2)"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察模型后，再按该逻辑体实际功能做进入或交互测试；特殊逻辑体的功能范围不保证同步缩放。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-309",
        "desktop-1-312"
      ],
      "caption": "在 (2,2,2) 创建原尺寸的测试触发区域",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：保存触发区域预设“测试区域预设”，配置可观察的进入事件，准备在线玩家 P。；确认坐标 (2,2,2) 为空旷测试位置。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "创建触发区域",
                " ",
                {
                  "kind": "literal",
                  "text": "触发区域预设选择：测试区域预设"
                },
                " 坐标 ",
                {
                  "kind": "literal",
                  "text": "坐标点 (2,2,2)"
                },
                " 旋转 ",
                {
                  "kind": "literal",
                  "text": "旋转角 (0,0,0)"
                },
                " 缩放 ",
                {
                  "kind": "literal",
                  "text": "向量 (1,1,1)"
                },
                " 所属玩家 ",
                {
                  "kind": "variable",
                  "text": "P"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "P 是在线玩家变量。单次创建后从外部走入，观察预设中已配置的进入事件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-91",
        "desktop-1-91"
      ],
      "caption": "把入口公告牌文字改为训练场指引",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在场景放置公告牌组件“入口说明牌”，保持可见并让玩家能走近阅读。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置公告牌文本内容",
                " ",
                {
                  "kind": "literal",
                  "text": "组件选择：入口说明牌"
                },
                " 文本 ",
                {
                  "kind": "literal",
                  "text": "请从左侧进入训练场"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "必须选真正的公告牌组件；普通方块或 UI 文本控件都不是本动作的目标。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-1-261",
        "desktop-1-264"
      ],
      "caption": "先显示 NPC 名称，再写入“训练向导”",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备生物“测试NPC”，先用设置生物是否显示名称将显示开关设为真。 准备完成后，向关卡发送自定义事件“运行示例”触发本图。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            " ",
            {
              "kind": "literal",
              "text": "运行示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置生物是否显示名称",
                " ",
                {
                  "kind": "literal",
                  "text": "生物选择：测试NPC"
                },
                " 显示名称 ",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置生物的显示名称",
                " ",
                {
                  "kind": "literal",
                  "text": "生物选择：测试NPC"
                },
                " 名称 ",
                {
                  "kind": "literal",
                  "text": "训练向导"
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "开启名称显示是原精选要求的前置步骤；执行后靠近 NPC 观察。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-388",
        "desktop-4-388"
      ],
      "caption": "7.5 除以 2.5，保存定点数结果 3",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：新建定点数变量“单份价格”，开启监听。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "单份价格"
                },
                "为",
                {
                  "kind": "value",
                  "text": "实数运算(+-×÷)",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "7.5"
                    },
                    {
                      "kind": "literal",
                      "text": "÷"
                    },
                    {
                      "kind": "literal",
                      "text": "2.5"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 3。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-389",
        "desktop-4-389"
      ],
      "caption": "两个向量相加，得到 (5,7,9)",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：用向量分组的构造积木准备 A=(1,2,3)、B=(4,5,6)。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "A"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（向量）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "1"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "2"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "3"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "B"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（向量）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "4"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "5"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "6"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "向量运算(+-×÷)",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "+"
                    },
                    {
                      "kind": "variable",
                      "text": "A"
                    },
                    {
                      "kind": "variable",
                      "text": "B"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：得到向量 (5,7,9)。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-390",
        "desktop-4-390"
      ],
      "caption": "整数 −8 取绝对值，得到 8",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数 -8。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "取绝对值（整数）",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "-8"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 8。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-403",
        "desktop-4-403"
      ],
      "caption": "定点数 −2.5 取绝对值，得到 2.5",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备定点数 -2.5。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "取绝对值（定点数）",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "-2.5"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 2.5。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-391",
        "desktop-4-391"
      ],
      "caption": "4 的阶乘得到 24",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数 4。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "阶乘",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "4"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：4! = 1 × 2 × 3 × 4 = 24。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-392",
        "desktop-4-392"
      ],
      "caption": "5 人中选有顺序的 2 人，共 20 种",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备总人数 5、选取人数 2。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "排列数"
                },
                "为",
                {
                  "kind": "value",
                  "text": "排列",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "5"
                    },
                    "中选",
                    {
                      "kind": "literal",
                      "text": "2"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 5 × 4 = 20。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-393",
        "desktop-4-393"
      ],
      "caption": "5 人中任选 2 人，共 10 组",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备总人数 5、选取人数 2。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "组合数"
                },
                "为",
                {
                  "kind": "value",
                  "text": "组合",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "5"
                    },
                    "中选",
                    {
                      "kind": "literal",
                      "text": "2"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 10；甲乙与乙甲只计为一组。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-394",
        "desktop-4-394"
      ],
      "caption": "12 和 18 的最大公约数是 6",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数 12、18。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "最大公约数",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "12"
                    },
                    {
                      "kind": "literal",
                      "text": "18"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 6。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-395",
        "desktop-4-395"
      ],
      "caption": "4 和 6 的最小公倍数是 12",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备循环周期整数 4、6。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "重合周期"
                },
                "为",
                {
                  "kind": "value",
                  "text": "最小公倍数",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "4"
                    },
                    {
                      "kind": "literal",
                      "text": "6"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 12；若两轮计时同时开始，每 12 个时间单位重合一次。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-396",
        "desktop-4-396"
      ],
      "caption": "按角度制计算 sin(90°)",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备定点数 90。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "正弦",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "90"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：数学结果为 1；以引擎定点精度显示。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-397",
        "desktop-4-397"
      ],
      "caption": "计算 cos(0°)，得到 1",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备定点数 0。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "余弦",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "0"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 1。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-404",
        "desktop-4-404"
      ],
      "caption": "9 开 2 次方得到 3",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备被开方数 9、次数 2。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "开方",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "9"
                    },
                    "开",
                    {
                      "kind": "literal",
                      "text": "2"
                    },
                    "次方"
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 3。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-405",
        "desktop-4-405"
      ],
      "caption": "81 以 3 为底的对数是 4",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备真数 81、底数 3。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "对数",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "81"
                    },
                    "底数",
                    {
                      "kind": "literal",
                      "text": "3"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 4，因为 3⁴=81。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-406",
        "desktop-4-406"
      ],
      "caption": "正数 3.8 转整数得到 3",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备定点数 3.8。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "转整数（向下取整）",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "3.8"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 3。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-407",
        "desktop-4-407"
      ],
      "caption": "同一个 3.2 分别向上和向下取整",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备定点数 3.2。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "向上结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "转整数（自选方式）",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "3.2"
                    },
                    {
                      "kind": "literal",
                      "text": "向上"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "向下结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "转整数（自选方式）",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "3.2"
                    },
                    {
                      "kind": "literal",
                      "text": "向下"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：向上取整得到 4；向下取整得到 3。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-408",
        "desktop-4-408"
      ],
      "caption": "3.6 四舍五入得到整数 4",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备定点数 3.6。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "转整数（四舍五入）",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "3.6"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 4。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-435",
        "desktop-4-435"
      ],
      "caption": "数字字符串先转实数，再加 0.5",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备字符串“2.5”。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "实数运算(+-×÷)",
                  "parts": [
                    {
                      "kind": "value",
                      "text": "转实数",
                      "parts": [
                        {
                          "kind": "literal",
                          "text": "“2.5”"
                        }
                      ]
                    },
                    {
                      "kind": "literal",
                      "text": "+"
                    },
                    {
                      "kind": "literal",
                      "text": "0.5"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：最终结果为 3。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-436",
        "desktop-4-436"
      ],
      "caption": "按一次互动按钮，只掷一次 1～6 的点数",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备最小值 1、最大值 6。 完成对象及数据准备后，在试玩中按下本图指定组件的互动按钮，由对应按钮事件触发。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "指定组件互动按钮被按下",
            {
              "kind": "variable",
              "text": "掷骰按钮"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "本次点数"
                },
                "为",
                {
                  "kind": "value",
                  "text": "随机整数",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "1"
                    },
                    {
                      "kind": "literal",
                      "text": "6"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先创建具有互动按钮的组件，并将组件引用保存为“掷骰按钮”。这张图由实际按钮事件触发；每次只保存一次随机结果，后续显示和判断读取粉色变量“本次点数”。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：每次结果都是 1、2、3、4、5、6 中的一个，不保证相邻两次不同。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-416",
        "desktop-4-416"
      ],
      "caption": "随机等待时间落在 1.5～2.5 之间",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备下界 1.5、上界 2.5。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "等待秒数"
                },
                "为",
                {
                  "kind": "value",
                  "text": "随机实数",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "1.5"
                    },
                    {
                      "kind": "literal",
                      "text": "2.5"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果满足 1.5≤等待秒数≤2.5；具体数值每次可能不同。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-417",
        "desktop-4-417"
      ],
      "caption": "3.1416 四舍五入保留两位，输出字符串",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备定点数 3.1416。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "显示值"
                },
                "为",
                {
                  "kind": "value",
                  "text": "格式化实数",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "3.1416"
                    },
                    {
                      "kind": "literal",
                      "text": "四舍五入"
                    },
                    {
                      "kind": "literal",
                      "text": "2"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：显示值为“3.14”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-418",
        "desktop-4-418"
      ],
      "caption": "把 −1.5 限制在下限 0",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备值 -1.5 和下限 0.0。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "取较大值（定点数）",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "-1.5"
                    },
                    {
                      "kind": "literal",
                      "text": "0.0"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 0。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-429",
        "desktop-4-429"
      ],
      "caption": "取 8.5 与 6.0 的较小值",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备当前值 8.5、上限 6.0。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "取较小值（定点数）",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "8.5"
                    },
                    {
                      "kind": "literal",
                      "text": "6.0"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 6。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-447",
        "desktop-4-447"
      ],
      "caption": "取整数 −2 与 0 的较大值",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数 -2、0。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "取较大值（整数）",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "-2"
                    },
                    {
                      "kind": "literal",
                      "text": "0"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为整数 0。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-448",
        "desktop-4-448"
      ],
      "caption": "当前人数 7 与名额 4 取较小值",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数当前人数 7、名额 4。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "取较小值（整数）",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "7"
                    },
                    {
                      "kind": "literal",
                      "text": "4"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 4。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-411",
        "desktop-4-411"
      ],
      "caption": "向量内积：1×4＋2×5＋3×6＝32",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备向量 A=(1,2,3)、B=(4,5,6)。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "A"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（向量）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "1"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "2"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "3"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "B"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（向量）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "4"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "5"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "6"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "点乘结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "向量的点乘",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "A"
                    },
                    {
                      "kind": "variable",
                      "text": "B"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 1×4+2×5+3×6=32。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-412",
        "desktop-4-412"
      ],
      "caption": "从 10 到 20 插值四分之一，得到 12.5",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备起点 10、终点 20、比例 0.25。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取实数线性插值",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "10"
                    },
                    {
                      "kind": "literal",
                      "text": "20"
                    },
                    {
                      "kind": "literal",
                      "text": "0.25"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 12.5。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-492",
        "desktop-4-492"
      ],
      "caption": "用三个数字构造坐标点 (1,2,3)",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：打开“位置”分组的“由实数获得[X:0, Y:0, Z:0]”。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "目标点"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（坐标点）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "1"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "2"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "3"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：目标点为坐标 (1,2,3)。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-514",
        "desktop-4-514"
      ],
      "caption": "用三个数字构造位移向量 (3,0,4)",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：打开“向量”分组的“由实数获得[X:0, Y:0, Z:0]”。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "位移"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（向量）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "3"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "4"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：得到向量 (3,0,4)，长度为 5。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-494",
        "desktop-4-494"
      ],
      "caption": "原点到 (3,0,4) 的直线距离为 5",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备坐标 A=(0,0,0)、B=(3,0,4)。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "A"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（坐标点）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "0"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "B"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（坐标点）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "3"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "4"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "距离"
                },
                "为",
                {
                  "kind": "value",
                  "text": "两点间距离",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "A"
                    },
                    {
                      "kind": "variable",
                      "text": "B"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 5。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-495",
        "desktop-4-495"
      ],
      "caption": "坐标点的 XYZ 不变，转换为向量",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备坐标点 (1,2,3)。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果向量"
                },
                "为",
                {
                  "kind": "value",
                  "text": "位置转化为向量",
                  "parts": [
                    {
                      "kind": "value",
                      "text": "由实数获得（坐标点）",
                      "parts": [
                        "X",
                        {
                          "kind": "literal",
                          "text": "1"
                        },
                        "Y",
                        {
                          "kind": "literal",
                          "text": "2"
                        },
                        "Z",
                        {
                          "kind": "literal",
                          "text": "3"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：得到向量 (1,2,3)。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-525",
        "desktop-4-525"
      ],
      "caption": "向量的 XYZ 不变，转换为坐标点",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备向量 (1,2,3)。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果坐标"
                },
                "为",
                {
                  "kind": "value",
                  "text": "向量转化为坐标",
                  "parts": [
                    {
                      "kind": "value",
                      "text": "由实数获得（向量）",
                      "parts": [
                        "X",
                        {
                          "kind": "literal",
                          "text": "1"
                        },
                        "Y",
                        {
                          "kind": "literal",
                          "text": "2"
                        },
                        "Z",
                        {
                          "kind": "literal",
                          "text": "3"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：得到坐标点 (1,2,3)。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-496",
        "desktop-4-496"
      ],
      "caption": "从 (1,2,3) 沿 +Z 偏移 5",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备起点 (1,2,3)、偏移向量 (0,0,5)。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果坐标"
                },
                "为",
                {
                  "kind": "value",
                  "text": "极坐标偏移",
                  "parts": [
                    {
                      "kind": "value",
                      "text": "由实数获得（坐标点）",
                      "parts": [
                        "X",
                        {
                          "kind": "literal",
                          "text": "1"
                        },
                        "Y",
                        {
                          "kind": "literal",
                          "text": "2"
                        },
                        "Z",
                        {
                          "kind": "literal",
                          "text": "3"
                        }
                      ]
                    },
                    {
                      "kind": "value",
                      "text": "由实数获得（向量）",
                      "parts": [
                        "X",
                        {
                          "kind": "literal",
                          "text": "0"
                        },
                        "Y",
                        {
                          "kind": "literal",
                          "text": "0"
                        },
                        "Z",
                        {
                          "kind": "literal",
                          "text": "5"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为坐标点 (1,2,8)。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-499",
        "desktop-4-499"
      ],
      "caption": "路标零旋转时，沿局部 +Z 偏移 2",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：放置组件“路标”，位置为 (10,0,0)，旋转为零且局部 Z 轴与世界 +Z 一致。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "目标点"
                },
                "为",
                {
                  "kind": "value",
                  "text": "相对坐标偏移（组件）",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "路标"
                    },
                    {
                      "kind": "value",
                      "text": "由实数获得（向量）",
                      "parts": [
                        "X",
                        {
                          "kind": "literal",
                          "text": "0"
                        },
                        "Y",
                        {
                          "kind": "literal",
                          "text": "0"
                        },
                        "Z",
                        {
                          "kind": "literal",
                          "text": "2"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "“路标”是已取得的组件引用变量；位置为 (10,0,0)，旋转为零，才有本例 (10,0,2) 的结果。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：在本例零旋转条件下结果为 (10,0,2)。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-524",
        "desktop-4-524"
      ],
      "caption": "两点间方向保留方向、把长度变为 1",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备 A=(0,0,0)、B=(3,0,4)。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "A"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（坐标点）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "0"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "B"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（坐标点）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "3"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "4"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "方向"
                },
                "为",
                {
                  "kind": "value",
                  "text": "两点间方向",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "A"
                    },
                    {
                      "kind": "variable",
                      "text": "B"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 (0.6,0,0.8)，以定点精度为准。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-526",
        "desktop-4-526"
      ],
      "caption": "终点减起点得到位移 (3,0,4)",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备 A=(1,2,3)、B=(4,2,7)。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "A"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（坐标点）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "1"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "2"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "3"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "B"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（坐标点）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "4"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "2"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "7"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "位移"
                },
                "为",
                {
                  "kind": "value",
                  "text": "两点间向量",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "A"
                    },
                    {
                      "kind": "variable",
                      "text": "B"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 (3,0,4)，长度为 5。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-537",
        "desktop-4-537"
      ],
      "caption": "把 (3,0,4) 标准化为单位方向",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备向量 (3,0,4)。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "方向"
                },
                "为",
                {
                  "kind": "value",
                  "text": "向量的方向",
                  "parts": [
                    {
                      "kind": "value",
                      "text": "由实数获得（向量）",
                      "parts": [
                        "X",
                        {
                          "kind": "literal",
                          "text": "3"
                        },
                        "Y",
                        {
                          "kind": "literal",
                          "text": "0"
                        },
                        "Z",
                        {
                          "kind": "literal",
                          "text": "4"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 (0.6,0,0.8)，以定点精度为准。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-538",
        "desktop-4-538"
      ],
      "caption": "向量 (3,0,4) 的长度为 5",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备向量 (3,0,4)。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "长度"
                },
                "为",
                {
                  "kind": "value",
                  "text": "向量的长度",
                  "parts": [
                    {
                      "kind": "value",
                      "text": "由实数获得（向量）",
                      "parts": [
                        "X",
                        {
                          "kind": "literal",
                          "text": "3"
                        },
                        "Y",
                        {
                          "kind": "literal",
                          "text": "0"
                        },
                        "Z",
                        {
                          "kind": "literal",
                          "text": "4"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 5。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-540",
        "desktop-4-540"
      ],
      "caption": "读取 (3,4,5) 的 X 分量",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备向量 (3,4,5)。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "向量的x值",
                  "parts": [
                    {
                      "kind": "value",
                      "text": "由实数获得（向量）",
                      "parts": [
                        "X",
                        {
                          "kind": "literal",
                          "text": "3"
                        },
                        "Y",
                        {
                          "kind": "literal",
                          "text": "4"
                        },
                        "Z",
                        {
                          "kind": "literal",
                          "text": "5"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 3。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-541",
        "desktop-4-541"
      ],
      "caption": "读取 (3,4,5) 的 Y 分量",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备向量 (3,4,5)。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "向量的y值",
                  "parts": [
                    {
                      "kind": "value",
                      "text": "由实数获得（向量）",
                      "parts": [
                        "X",
                        {
                          "kind": "literal",
                          "text": "3"
                        },
                        "Y",
                        {
                          "kind": "literal",
                          "text": "4"
                        },
                        "Z",
                        {
                          "kind": "literal",
                          "text": "5"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 4。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-542",
        "desktop-4-542"
      ],
      "caption": "读取 (3,4,5) 的 Z 分量",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备向量 (3,4,5)。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "向量的z值",
                  "parts": [
                    {
                      "kind": "value",
                      "text": "由实数获得（向量）",
                      "parts": [
                        "X",
                        {
                          "kind": "literal",
                          "text": "3"
                        },
                        "Y",
                        {
                          "kind": "literal",
                          "text": "4"
                        },
                        "Z",
                        {
                          "kind": "literal",
                          "text": "5"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 5。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-523",
        "desktop-4-523"
      ],
      "caption": "按手册分别获取东、北、上的世界方向",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个向量变量用于记录结果。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "东方向"
                },
                "为",
                {
                  "kind": "value",
                  "text": "世界方向（向量）",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "东"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "北方向"
                },
                "为",
                {
                  "kind": "value",
                  "text": "世界方向（向量）",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "北"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "上方向"
                },
                "为",
                {
                  "kind": "value",
                  "text": "世界方向（向量）",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "上"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：手册定义：东=(0,0,-1)，北=(1,0,0)，上=(0,1,0)。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-516",
        "desktop-4-516"
      ],
      "caption": "两个向量按 0.25 插值，得到 (1,0,2)",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备 A=(0,0,0)、B=(4,0,8)、比例 0.25。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "A"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（向量）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "0"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "B"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（向量）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "4"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "8"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取向量线性插值",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "A"
                    },
                    {
                      "kind": "variable",
                      "text": "B"
                    },
                    {
                      "kind": "literal",
                      "text": "0.25"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为向量 (1,0,2)。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-452",
        "desktop-4-452"
      ],
      "caption": "把“金币：”和“12”拼成一个字符串",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备字符串“金币：”与字符串“12”。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "显示文本"
                },
                "为",
                {
                  "kind": "value",
                  "text": "字符串扩展",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "金币："
                    },
                    {
                      "kind": "literal",
                      "text": "12"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为“金币：12”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-453",
        "desktop-4-453"
      ],
      "caption": "先把整数 12 转为字符串，再拼接提示",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数 12。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "显示文本"
                },
                "为",
                {
                  "kind": "value",
                  "text": "字符串扩展",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "金币："
                    },
                    {
                      "kind": "value",
                      "text": "转字符串",
                      "parts": [
                        {
                          "kind": "literal",
                          "text": "12"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：显示“金币：12”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-454",
        "desktop-4-454"
      ],
      "caption": "用竖线连接三个队名",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备字符串列表 [“红队”,“蓝队”,“绿队”]。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                {
                  "kind": "variable",
                  "text": "队名列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "队名列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "红队"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "队名列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "蓝队"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "队名列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "绿队"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "连接结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "拼接字符串",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "|"
                    },
                    {
                      "kind": "variable",
                      "text": "队名列表"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先创建字符串列表变量“队名列表”；初始化时清空后依次加入三个队名。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为“红队|蓝队|绿队”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-455",
        "desktop-4-455"
      ],
      "caption": "严格按手册例：abcde 的 1～3 得到 bc",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备字符串“abcde”。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "截取结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "截取字符串",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "abcde"
                    },
                    {
                      "kind": "literal",
                      "text": "1"
                    },
                    {
                      "kind": "literal",
                      "text": "3"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为“bc”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-466",
        "desktop-4-466"
      ],
      "caption": "按竖线拆分文本，再读取列表长度",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备字符串“红队|蓝队|绿队”。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "队名列表"
                },
                "为",
                {
                  "kind": "value",
                  "text": "分割字符串",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "|"
                    },
                    {
                      "kind": "literal",
                      "text": "红队|蓝队|绿队"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "元素数量"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取列表长度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "队名列表"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 [“红队”,“蓝队”,“绿队”]，列表长度为 3。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-467",
        "desktop-4-467"
      ],
      "caption": "把属性标记替换成 32",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备字符串“攻击力%atk”。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "显示文本"
                },
                "为",
                {
                  "kind": "value",
                  "text": "替换字符串内容",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "攻击力%atk"
                    },
                    {
                      "kind": "literal",
                      "text": "%atk"
                    },
                    {
                      "kind": "literal",
                      "text": "32"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为“攻击力32”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-468",
        "desktop-4-468"
      ],
      "caption": "abcde 含 5 个字符",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备字符串“abcde”。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "长度"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取字符串长度",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "abcde"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 5。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-438",
        "desktop-4-438"
      ],
      "caption": "复制 A 后只向 A 添加 30，B 保持两项",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数列表 A=[10,20]。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                {
                  "kind": "variable",
                  "text": "A"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "A"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "A"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "B"
                },
                "为",
                {
                  "kind": "value",
                  "text": "复制列表：整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "A"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "A"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "30"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "A长度"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取列表长度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "A"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "B长度"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取列表长度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "B"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "A、B 均为整数列表变量，A长度、B长度为整数变量。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：A 长度为 3，B 长度仍为 2；B 内容仍为 [10,20]。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-439",
        "desktop-4-439"
      ],
      "caption": "从三个整数中随机抽两个且不重复",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备不含重复项的整数列表 [10,20,30]。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                {
                  "kind": "variable",
                  "text": "候选"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "候选"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "候选"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "候选"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "30"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "抽取结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "列表中随机取值：整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "候选"
                    },
                    "数量",
                    {
                      "kind": "literal",
                      "text": "2"
                    },
                    "允许重复",
                    {
                      "kind": "literal",
                      "text": "假"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果长度"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取列表长度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "抽取结果"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：返回列表长度为 2，元素来自 10、20、30 且两项不同；具体组合和顺序不固定。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-440",
        "desktop-4-440"
      ],
      "caption": "从 [10,20,30] 只抽取一个整数",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备非空整数列表 [10,20,30]。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                {
                  "kind": "variable",
                  "text": "候选"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "候选"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "候选"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "候选"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "30"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "本次结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "列表中随机取一个值:整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "候选"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "候选是整数列表，本次结果是单个整数；保留原文参数未写“列表”的核对提示。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果是 10、20、30 中的一个整数。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-449",
        "desktop-4-449"
      ],
      "caption": "升序重排原列表 [30,10,20]",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数列表 A=[30,10,20]，开启监听。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                {
                  "kind": "variable",
                  "text": "A"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "A"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "30"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "A"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "A"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "排序返回值"
                },
                "为",
                {
                  "kind": "value",
                  "text": "列表排序（整数）",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "A"
                    },
                    {
                      "kind": "literal",
                      "text": "升序"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "监听整数列表 A 的顺序，应变为 [10,20,30]；原文没有独立说明返回类型，“排序返回值”变量须按编辑器输出类型创建。图中没有假定复制出新列表。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：A 的顺序变为 [10,20,30]。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-977",
        "desktop-4-977"
      ],
      "caption": "统计 [7,8,7,7] 中整数 7 出现几次",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数列表 [7,8,7,7]。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                {
                  "kind": "variable",
                  "text": "样本列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "样本列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "7"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "样本列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "8"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "样本列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "7"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "样本列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "7"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "匹配数量"
                },
                "为",
                {
                  "kind": "value",
                  "text": "列表中指定元素数量",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "样本列表"
                    },
                    {
                      "kind": "literal",
                      "text": "7"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 3。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-979",
        "desktop-4-979"
      ],
      "caption": "找不到 99 时返回 −1，再用条件判断",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数列表 [10,20,30]。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                {
                  "kind": "variable",
                  "text": "样本列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "样本列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "样本列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "样本列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "30"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "查找索引"
                },
                "为",
                {
                  "kind": "value",
                  "text": "列表中指定元素的索引",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "样本列表"
                    },
                    {
                      "kind": "literal",
                      "text": "99"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "比较",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "查找索引"
                    },
                    {
                      "kind": "literal",
                      "text": "="
                    },
                    {
                      "kind": "literal",
                      "text": "-1"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "未找到99"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "找到99"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：索引为 -1，比较结果为真。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-444",
        "desktop-4-444"
      ],
      "caption": "读取奖励表第 1001 行“金币”列的整数",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备表格“奖励表”，在实际存在的行索引 1001、列名“金币”中保存整数 50。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "奖励金币"
                },
                "为",
                {
                  "kind": "value",
                  "text": "表格取值：整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "奖励表"
                    },
                    "行",
                    {
                      "kind": "literal",
                      "text": "1001"
                    },
                    "列",
                    {
                      "kind": "literal",
                      "text": "金币"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先实际创建行索引 1001 与整数列“金币”，写入 50；不能把示例行号当成自动存在的行。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为整数 50。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-445",
        "desktop-4-445"
      ],
      "caption": "从 1∶3 的整数奖励池抽一次",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：创建整数权重池：10 的权重为 1，20 的权重为 3。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "本次奖励"
                },
                "为",
                {
                  "kind": "value",
                  "text": "权重池中随机取一个值:整数",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "奖励池"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "“奖励池”为整数权重池变量，元素 10 的权重是 1，元素 20 的权重是 3；随机结果只能来自 10 或 20，不预画为固定结果。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果只能是 10 或 20；在这种配置下理论概率分别为 1/4 和 3/4，不保证每四次恰好出现一次和三次。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-1046",
        "desktop-4-1046"
      ],
      "caption": "复制单位列表后，仅从原列表移除 U2",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备两个有效单位引用 U1、U2，将其加入单位列表 A。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "B"
                },
                "为",
                {
                  "kind": "value",
                  "text": "复制列表：单位",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "A"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表移除（指定元素）",
                {
                  "kind": "variable",
                  "text": "A"
                },
                "元素",
                {
                  "kind": "variable",
                  "text": "U2"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "A长度"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取列表长度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "A"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "B长度"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取列表长度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "B"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "A 为已包含 U1、U2 的单位列表；U2 是同一个单位引用。移除列表元素不销毁场景单位。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：A 长度为 1，B 长度为 2；B 仍保存 U1、U2 两个引用。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-1049",
        "desktop-4-1049"
      ],
      "caption": "读取机关的单位属性，再检查引用存在",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备对象“机关”和有效单位 U。；预先在机关上设置单位类型自定义属性“绑定目标”=U。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "绑定目标"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取自定义属性：单位",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "机关"
                    },
                    {
                      "kind": "literal",
                      "text": "绑定目标"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "对象存在",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "绑定目标"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "绑定目标仍存在"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "绑定目标不存在"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "预先把机关的单位类型属性“绑定目标”写为有效单位 U。读取结果与 U 指向同一单位。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：U 仍有效时，读出的对象就是 U，存在判断为真。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-140",
        "desktop-4-140"
      ],
      "caption": "游戏初始化读取静止地标的位置",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在 (2,0,3) 放置一个不会运动的组件“地标”。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "地标位置"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取组件位置",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "地标"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "“地标”引用应在场景对象选择器中预先绑定，组件静止于 (2,0,3)，不是运行时尚未创建的对象。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为坐标点 (2,0,3)。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-128",
        "desktop-4-128"
      ],
      "caption": "读取公告牌实际配置的欢迎文字",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：放置公告牌组件“入口说明”，将文本设为“欢迎来到训练场”。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "公告内容"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取公告牌的文本内容",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "入口说明"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "入口说明必须为公告牌组件，内容预先设为“欢迎来到训练场”。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为“欢迎来到训练场”。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-136",
        "desktop-4-136"
      ],
      "caption": "没有抓举时，获取组件返回空引用",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：让角色 R 保持没有抓举任何对象的状态。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "抓举组件"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取正在抓举的组件",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "R"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "对象存在",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "抓举组件"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "取得抓举组件"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "没有抓举组件"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "R 为已存在且当前没有抓举物体的角色/生物引用；存在判断应走假分支。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：取值为空，存在判断为假。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-315",
        "desktop-4-315"
      ],
      "caption": "读取传送门逻辑体的位置",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在 (5,0,2) 放置一个逻辑体“传送门”。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "传送门位置"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取逻辑体坐标",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "传送门"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "传送门是逻辑体引用变量，预先放置在 (5,0,2)，不要传入组件引用。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为坐标点 (5,0,2)。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-205",
        "desktop-4-205"
      ],
      "caption": "由玩家取得角色，确认存在后才读取坐标",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在一个玩家 P 已进入地图且控制角色 R 的事件中运行。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "当前角色"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取玩家控制角色",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "P"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "对象存在",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "当前角色"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "设置变量",
                    {
                      "kind": "variable",
                      "text": "角色位置"
                    },
                    "为",
                    {
                      "kind": "value",
                      "text": "获取角色/生物位置",
                      "parts": [
                        {
                          "kind": "variable",
                          "text": "当前角色"
                        }
                      ]
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "玩家尚未控制角色"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "在 P 已进入且控制角色 R 后触发；P 为玩家变量，当前角色为角色/生物变量。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：返回当前被 P 控制的角色 R；位置取值应与 R 的实际位置一致。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-554",
        "desktop-4-554"
      ],
      "caption": "从角色找到控制它的玩家，再读取昵称",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在角色 R 已由玩家 P 控制后运行。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "控制者"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取控制角色的玩家",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "R"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "控制者昵称"
                },
                "为",
                {
                  "kind": "value",
                  "text": "玩家名称",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "控制者"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "R 必须是已经由玩家 P 控制的角色蛋仔，不能用生物代替。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：得到玩家 P；昵称应是控制 R 的玩家昵称。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-241",
        "desktop-4-241"
      ],
      "caption": "读取在线玩家列表，再统计当前人数",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在仅玩家 P1、P2 在线的试玩场景中进行检查。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "在线玩家"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取所有在线玩家",
                  "parts": []
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "在线人数"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取列表长度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "在线玩家"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先保证只有 P1、P2 两位玩家在线，再发送本例事件；离线后必须重新触发读取。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：列表包含 P1、P2，长度为 2；后续离线状态确认后重新获取会反映当前在线情况。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-549",
        "desktop-4-549"
      ],
      "caption": "读取已写入 3 的整数游玩进度",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在“游玩进度→自定义”创建整数类型进度“已通关数”。；先把当前玩家 P 的这项进度设置为 3，并确保本次游戏已开启相应进度功能。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "已通关数值"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取整数类型游玩进度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "P"
                    },
                    {
                      "kind": "variable",
                      "text": "已通关数进度"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "“已通关数进度”保存游玩进度条目引用；先创建该整数进度并将 P 的值设为 3。它不是字符串，也不是数值变量本身。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为整数 3。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-2",
        "desktop-2-2"
      ],
      "caption": "把 3＞5 的假取反，执行真分支",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：用比较积木构造条件“3 大于 5”。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "非",
                  "parts": [
                    {
                      "kind": "condition",
                      "text": "比较",
                      "parts": [
                        {
                          "kind": "literal",
                          "text": "3"
                        },
                        {
                          "kind": "literal",
                          "text": ">"
                        },
                        {
                          "kind": "literal",
                          "text": "5"
                        }
                      ]
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "条件成立"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "条件不成立"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：3>5 为假，取反后为真，执行“如果”分支。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-3",
        "desktop-2-3"
      ],
      "caption": "一个条件成立，或的结果就为真",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备条件 A：3<5；条件 B：2>9。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "或",
                  "parts": [
                    {
                      "kind": "condition",
                      "text": "比较",
                      "parts": [
                        {
                          "kind": "literal",
                          "text": "3"
                        },
                        {
                          "kind": "literal",
                          "text": "<"
                        },
                        {
                          "kind": "literal",
                          "text": "5"
                        }
                      ]
                    },
                    {
                      "kind": "condition",
                      "text": "比较",
                      "parts": [
                        {
                          "kind": "literal",
                          "text": "2"
                        },
                        {
                          "kind": "literal",
                          "text": ">"
                        },
                        {
                          "kind": "literal",
                          "text": "9"
                        }
                      ]
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "条件成立"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "条件不成立"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：A 真、B 假，最终为真，执行“如果”分支。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-4",
        "desktop-2-4"
      ],
      "caption": "金币够、等级不够，与的结果为假",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备条件 A：金币 10≥5；条件 B：等级 2≥3。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "金币"
                },
                "为",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "等级"
                },
                "为",
                {
                  "kind": "literal",
                  "text": "2"
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "与",
                  "parts": [
                    {
                      "kind": "condition",
                      "text": "比较",
                      "parts": [
                        {
                          "kind": "variable",
                          "text": "金币"
                        },
                        {
                          "kind": "literal",
                          "text": "≥"
                        },
                        {
                          "kind": "literal",
                          "text": "5"
                        }
                      ]
                    },
                    {
                      "kind": "condition",
                      "text": "比较",
                      "parts": [
                        {
                          "kind": "variable",
                          "text": "等级"
                        },
                        {
                          "kind": "literal",
                          "text": "≥"
                        },
                        {
                          "kind": "literal",
                          "text": "3"
                        }
                      ]
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "条件成立"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "条件不成立"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：A 真、B 假，最终为假，执行“否则”分支。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-35",
        "desktop-2-35"
      ],
      "caption": "同一文本分别查找 bc 和 xy",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备字符串“abcde”。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "是否存在字符串",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "abcde"
                    },
                    {
                      "kind": "literal",
                      "text": "bc"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "存在bc"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "不存在bc"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "是否存在字符串",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "abcde"
                    },
                    {
                      "kind": "literal",
                      "text": "xy"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "存在xy"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "不存在xy"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：“bc”存在，返回真；“xy”不存在，返回假。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-60",
        "desktop-2-61"
      ],
      "caption": "判断整数列表是否包含 20 与 99",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备整数列表 [10,20,30]。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                {
                  "kind": "variable",
                  "text": "样本列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "样本列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "10"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "样本列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "20"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "样本列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "30"
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "列表存在元素",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "样本列表"
                    },
                    {
                      "kind": "literal",
                      "text": "20"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "包含20"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "不包含20"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "列表存在元素",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "样本列表"
                    },
                    {
                      "kind": "literal",
                      "text": "99"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "包含99"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "不包含99"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：20 的判断为真，99 的判断为假。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-59",
        "desktop-2-60"
      ],
      "caption": "先查找假所在索引，再把布尔取值接入如果",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备布尔值列表 [真,假]。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "移除列表所有元素",
                {
                  "kind": "variable",
                  "text": "布尔列表"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "布尔列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "列表添加（增加）",
                {
                  "kind": "variable",
                  "text": "布尔列表"
                },
                "元素",
                {
                  "kind": "literal",
                  "text": "假"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "假值索引"
                },
                "为",
                {
                  "kind": "value",
                  "text": "列表中指定元素的索引",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "布尔列表"
                    },
                    {
                      "kind": "literal",
                      "text": "假"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "列表取值：布尔值",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "布尔列表"
                    },
                    {
                      "kind": "variable",
                      "text": "假值索引"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "条件成立"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "条件不成立"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "布尔列表中的真、假是布尔常量，不是文字字符串；本例取出的合法结果是假，走否则分支。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：取值为假，执行“否则”分支。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-24",
        "desktop-2-24"
      ],
      "caption": "同一条件分别识别角色 R 和生物 N",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备一个角色 R 和一个生物 N 的有效引用。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "是否为角色",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "R"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "R是角色"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "R不是角色"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "是否为角色",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "N"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "N是角色"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "N不是角色"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "R 为角色，N 为生物，二者都已创建且有效。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：R 返回真，N 返回假。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-25",
        "desktop-2-25"
      ],
      "caption": "站稳与跳起后的两次检查分开发生",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：让角色 R 站稳在具有碰撞的平地上。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“检查落地”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "检查落地"
            }
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "是否位于地面",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "R"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "位于地面"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "正在腾空"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "检查腾空"
            }
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "是否位于地面",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "R"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "仍位于地面"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "已离开地面"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "站稳后发送“检查落地”；实际跳离地面后再发送“检查腾空”。两个事件分别触发，不把同一时刻的两次读取当作跳跃前后。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：站稳时为真，腾空时为假。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-33",
        "desktop-2-33"
      ],
      "caption": "读取区域中心坐标，再判断它位于区域内部",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：建立触发区域 A，并记录其中心点 P，确保 P 位于区域内部。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "P"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取触发区域坐标",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "A"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "坐标点是否在触发区域内",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "P"
                    },
                    {
                      "kind": "variable",
                      "text": "A"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "条件成立"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "条件不成立"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "A 是已建立的触发区域；本例用其中心点，避开边界包含规则。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为真。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-2-10",
        "desktop-2-10"
      ],
      "caption": "模型显示开启与关闭后分别检查",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备组件 C，并把其模型显示设为开启。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "是否显示模型（组件）",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "C"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "条件成立"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "条件不成立"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "关闭后检查"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置组件模型显示/隐藏",
                {
                  "kind": "variable",
                  "text": "C"
                },
                {
                  "kind": "literal",
                  "text": "假"
                }
              ]
            },
            {
              "kind": "control",
              "parts": [
                "如果",
                {
                  "kind": "condition",
                  "text": "是否显示模型（组件）",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "C"
                    }
                  ]
                }
              ],
              "children": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "条件成立"
                    }
                  ]
                }
              ],
              "otherwise": [
                {
                  "kind": "action",
                  "parts": [
                    "发送信息",
                    {
                      "kind": "literal",
                      "text": "条件不成立"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "第一次触发前先把 C 的模型显示设为开启。观察真分支后再发送“关闭后检查”，第二次走假分支；没有关闭物理。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为真；将模型显示关闭后再次检查应为假。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-518",
        "desktop-4-518"
      ],
      "caption": "先开启监听，再按事件读取和比较相机方向",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备在线玩家 P，先为 P 开启相机旋转监听。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“读取相机方向”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "开启相机监听"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置玩家相机旋转监听",
                {
                  "kind": "variable",
                  "text": "P"
                },
                {
                  "kind": "literal",
                  "text": "真"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "读取相机方向"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "相机方向"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取相机朝向",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "P"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "P 已在线后先发送“开启相机监听”；监听生效后发送“读取相机方向”。转动相机后再次发送读取事件，观察同一向量变量更新。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：相机转向不同方向时，获取到的朝向向量应随之改变。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-512",
        "desktop-4-512"
      ],
      "caption": "从高处向下射线检测，得到地面坐标",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在水平地面上方准备起点 P=(0,10,0)，地面顶面 Y=0，并开启其物理。；确保起点至地面间没有其他可检测物体。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "地面命中点"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取坐标朝指定方向投影后的坐标",
                  "parts": [
                    {
                      "kind": "value",
                      "text": "由实数获得（坐标点）",
                      "parts": [
                        "X",
                        {
                          "kind": "literal",
                          "text": "0"
                        },
                        "Y",
                        {
                          "kind": "literal",
                          "text": "10"
                        },
                        "Z",
                        {
                          "kind": "literal",
                          "text": "0"
                        }
                      ]
                    },
                    {
                      "kind": "value",
                      "text": "由实数获得（向量）",
                      "parts": [
                        "X",
                        {
                          "kind": "literal",
                          "text": "0"
                        },
                        "Y",
                        {
                          "kind": "literal",
                          "text": "-1"
                        },
                        "Z",
                        {
                          "kind": "literal",
                          "text": "0"
                        }
                      ]
                    },
                    {
                      "kind": "literal",
                      "text": "20"
                    },
                    {
                      "kind": "literal",
                      "text": "编辑器选择能检测地面的检测类型"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "地面顶面 Y=0、物理开启，射线途中没有其他物体。检测类型选择实际有效选项，不编造编号；无命中也会返回终点，不能据“有坐标”判断命中。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：在上述条件下返回地面命中坐标 (0,0,0)。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-173",
        "desktop-4-173"
      ],
      "caption": "运行时改为蓝色后，这个取值仍读初始红色",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：给有该染色区域的组件 C 在编辑状态下配置红色。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "初次读取颜色"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取组件指定染色区域的颜色",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "C"
                    },
                    {
                      "kind": "literal",
                      "text": "已配置的染色区域（实际选择）"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置组件染色区域",
                {
                  "kind": "variable",
                  "text": "C"
                },
                {
                  "kind": "literal",
                  "text": "同一染色区域（实际选择）"
                },
                {
                  "kind": "literal",
                  "text": "蓝色"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "再次读取颜色"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取组件指定染色区域的颜色",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "C"
                    },
                    {
                      "kind": "literal",
                      "text": "同一染色区域（实际选择）"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "在编辑状态给该染色区域设红色；三个区域槽必须选择同一真实区域。红色和蓝色通过颜色选择器填入，不是字符串。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：手册规定取到的是初始红色；动态改色不由此积木反映。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-399",
        "desktop-4-399"
      ],
      "caption": "反正弦输入 0.5，得到约 30 度",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备定点数 0.5，并创建定点数变量“角度结果”。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "角度结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "反正弦",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "0.5"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：数学结果为 30 度，以引擎定点精度为准。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-400",
        "desktop-4-400"
      ],
      "caption": "反余弦输入 0，得到约 90 度",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备定点数 0，并创建定点数变量“角度结果”。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "角度结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "反余弦",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "0"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 90 度，以引擎定点精度为准。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-450",
        "desktop-4-450"
      ],
      "caption": "查询整数 20 的权重，得到 3",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：新建整数权重池“奖励池”。；加入整数 10，权重设为 1；加入整数 20，权重设为 3。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "查询权重"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取指定元素在权重池的权重",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "奖励池"
                    },
                    {
                      "kind": "literal",
                      "text": "20"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "奖励池必须是整数权重池：10→权重1、20→权重3。20 是元素值，不是列表索引。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 3，这是整数 20 的权重。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-471",
        "desktop-4-471"
      ],
      "caption": "主 Z 轴向前、副 Y 轴向上，构造旋转",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备向量“前”=(0,0,1)、“上”=(0,1,0)。；准备一个旋转角变量“目标旋转”。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "前"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（向量）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "1"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "上"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（向量）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "1"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "0"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "目标旋转"
                },
                "为",
                {
                  "kind": "value",
                  "text": "旋转角指向（双轴）",
                  "parts": [
                    {
                      "kind": "literal",
                      "text": "Z轴（实际选项）"
                    },
                    {
                      "kind": "variable",
                      "text": "前"
                    },
                    {
                      "kind": "literal",
                      "text": "Y轴（实际选项）"
                    },
                    {
                      "kind": "variable",
                      "text": "上"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "两条轴互不相同，两向量互相垂直；下拉项使用编辑器实际名称，不猜枚举数字。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：旋转后的主 Z 轴指向世界 +Z，副 Y 轴指向世界 +Y；结果应保持这组前、上方向。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-520",
        "desktop-4-520"
      ],
      "caption": "从 A 到 B、再从 B 到 A，观察方向反转",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备两个不同坐标点 A=(0,0,0)、B=(5,0,0)。；该条目两槽都支持坐标点，可直接使用这两个位置验证。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "A"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（坐标点）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "0"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "B"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（坐标点）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "5"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "0"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "0"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "A到B方向"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取物体之间方向",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "A"
                    },
                    {
                      "kind": "variable",
                      "text": "B"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "B到A方向"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取物体之间方向",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "B"
                    },
                    {
                      "kind": "variable",
                      "text": "A"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：A 到 B 的方向沿世界 +X；交换后沿世界 -X。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-964",
        "desktop-4-964"
      ],
      "caption": "把编辑器认可的红色代码转换成颜色",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在编辑器支持的颜色设置中选择红色，并取得它显示或文档要求的十六进制代码，记作字符串 C。保留编辑器要求的前缀及位数。；创建颜色类型变量“结果颜色”。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "结果颜色"
                },
                "为",
                {
                  "kind": "value",
                  "text": "字符串转颜色",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "C"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "C 为预先保存的合法颜色代码字符串；保留编辑器要求的前缀及位数。代码未核实前不填“测试1”或猜测 # 格式。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：在使用编辑器有效红色代码的前提下，结果呈现红色。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-431",
        "desktop-4-431"
      ],
      "caption": "按实际 X/Y/Z 选项分别读取 3、4、5",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备向量 V=(3,4,5)。；在编辑器查看第二个槽如何选择 X、Y、Z。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "V"
                },
                "为",
                {
                  "kind": "value",
                  "text": "由实数获得（向量）",
                  "parts": [
                    "X",
                    {
                      "kind": "literal",
                      "text": "3"
                    },
                    "Y",
                    {
                      "kind": "literal",
                      "text": "4"
                    },
                    "Z",
                    {
                      "kind": "literal",
                      "text": "5"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "X值"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取向量/坐标点的XYZ值",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "V"
                    },
                    {
                      "kind": "literal",
                      "text": "编辑器核实的X选项"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "Y值"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取向量/坐标点的XYZ值",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "V"
                    },
                    {
                      "kind": "literal",
                      "text": "编辑器核实的Y选项"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "Z值"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取向量/坐标点的XYZ值",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "V"
                    },
                    {
                      "kind": "literal",
                      "text": "编辑器核实的Z选项"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "原文没有给出 X/Y/Z 的整数映射；先核实对应选项或编号。图中不填猜测的 0、1、2。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：选择 X 得 3，选择 Y 得 4，选择 Z 得 5。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-556",
        "mobile-4-557",
        "desktop-4-556",
        "desktop-4-557"
      ],
      "caption": "实际进度编号得到进度条目，再读取玩家数值",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在“游玩进度→自定义”创建整数类型的“已通关数”。；查看它实际生成的编号，记录为整数 R。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "已通关数进度"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取自定义进度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "R"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "已通关数值"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取整数类型游玩进度",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "P"
                    },
                    {
                      "kind": "variable",
                      "text": "已通关数进度"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "R 是从游玩进度配置中记录的真实整数编号；P 的这项整数进度已经写为 3。进度条目引用与数值分别保存，不把条目当作 3。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：选中的是“已通关数”进度条目；在写入 3 且进度功能正常启用后，后续玩家进度读取为 3。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-842",
        "desktop-4-842"
      ],
      "caption": "从父控件 P 获取唯一命名的子控件",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在一个已创建且可用的界面中取得父控件 P，确认 P 的类型为“界面控件”。；在 P 下准备一个名称唯一的子控件“提示文本”，并确认运行时已创建。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "提示控件"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取指定名称的界面控件",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "P"
                    },
                    {
                      "kind": "literal",
                      "text": "提示文本"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "P 是已创建的父界面控件引用；其下已有名称唯一的“提示文本”子控件。界面与控件创建完成后才能发送事件读取。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：取得 P 下名为“提示文本”的那个子控件。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-65",
        "desktop-4-65"
      ],
      "caption": "把时间戳 0 的年份字段读出为 1970",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：使用“转化整数为时间戳”，输入 0；官方说明该时间戳对应 1970 年 1 月 1 日 8 时 0 分 0 秒。；查看本积木第二个槽的实际选项或编辑器提示，确认其中“年份”对应的合法字段值。 纯计算或已预先存在的数据在游戏初始化后读取。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "游戏初始化"
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "年份结果"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取时间戳所在的时间",
                  "parts": [
                    {
                      "kind": "value",
                      "text": "转化整数为时间戳",
                      "parts": [
                        {
                          "kind": "literal",
                          "text": "0"
                        }
                      ]
                    },
                    {
                      "kind": "literal",
                      "text": "编辑器已核实的年份字段字符串"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先在编辑器核实第二个槽的合法字段字符串及输出类型，再按真实值填写；不猜 year、年或 YYYY。字段未核实前，这一参数仍待核对。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：在第二个槽确认为年份字段的前提下，结果应表达年份 1970；具体值类型以编辑器为准。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-840",
        "desktop-4-840"
      ],
      "caption": "从具名表现器得到场景界面，再取已有控件",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：准备有效组件 C，在它的预设配置中创建能承载场景界面的表现器，名称设为“血条表现器”。；为该表现器配置真实的场景界面资源，并使表现器处于正常激活、运行时界面已创建的状态。；在该场景界面内准备一个已存在的控件，便于后续验证取得的界面引用。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "S"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取组件表现器上的场景界面",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "C"
                    },
                    {
                      "kind": "literal",
                      "text": "血条表现器"
                    }
                  ]
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "验证控件"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取场景界面中的控件",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "S"
                    },
                    {
                      "kind": "variable",
                      "text": "已有控件选择"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "C 上的“血条表现器”已配置并激活真实场景界面；“已有控件选择”是在该场景界面中实际选择的控件参数。等界面创建完成再触发。S 是场景界面实例，不能用预设或普通控件替代。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：取得组件 C 上“血条表现器”所承载的场景界面引用 S。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-717",
        "desktop-4-717"
      ],
      "caption": "先设置商店金币售价 30，再读取同一价格",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在属性规则中创建玩家属性“金币”。；准备商店 S 和实际在 S 中出售的物品预设 G。；先用“设置物品商店物品售价”将商店 S、物品预设 G 的“金币”售价设为整数 30。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置物品商店物品售价",
                {
                  "kind": "variable",
                  "text": "S"
                },
                {
                  "kind": "variable",
                  "text": "G"
                },
                {
                  "kind": "literal",
                  "text": "金币"
                },
                {
                  "kind": "literal",
                  "text": "30"
                }
              ]
            },
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "商品金币售价"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取物品商店物品售价",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "S"
                    },
                    {
                      "kind": "variable",
                      "text": "G"
                    },
                    {
                      "kind": "literal",
                      "text": "金币"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "S 为商店，G 为 S 中实际出售的物品预设；玩家属性“金币”须预先创建。第二槽不放物品实例。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为 30；它是购买 G 所需的金币数，不是玩家当前持有的金币数。"
          ]
        }
      ]
    },
    {
      "exactIds": [
        "mobile-4-720",
        "desktop-4-720"
      ],
      "caption": "读取已配置物品实例的金币价值 15",
      "roots": [
        {
          "kind": "note",
          "parts": [
            "准备：在属性规则中创建玩家属性“金币”。；在测试物品对应的价值配置中，把“金币”这一项设为 15，并由该配置创建有效物品实例 I。；确认填写的是物品价值配置，而不是商店中的购买售价。 先完成对象及数据准备，再用“发送自定义事件”向关卡发送“运行取值示例”。不能用游戏初始化替代对象创建完成。 图中粉色项是已创建的同类型变量；对象引用、列表和资源引用须按准备说明保存到对应变量，不能用名称字符串代替。"
          ]
        },
        {
          "kind": "event",
          "parts": [
            "接收自定义事件（全局）",
            {
              "kind": "literal",
              "text": "运行取值示例"
            }
          ],
          "children": [
            {
              "kind": "action",
              "parts": [
                "设置变量",
                {
                  "kind": "variable",
                  "text": "物品金币价值"
                },
                "为",
                {
                  "kind": "value",
                  "text": "获取物品的价值",
                  "parts": [
                    {
                      "kind": "variable",
                      "text": "I"
                    },
                    {
                      "kind": "literal",
                      "text": "金币"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "note",
          "parts": [
            "先在物品价值配置中设置金币价值15，再创建物品实例 I；这不是商店售价。结果变量类型按编辑器输出确定。"
          ]
        },
        {
          "kind": "note",
          "parts": [
            "观察：结果为配置的 15；它反映 I 的金币价值。"
          ]
        }
      ]
    }
  ],
  "photos": [
    {
      "id": "event-action",
      "src": "assets/blocks-event-action.png",
      "alt": "黄色“指定角色/生物前扑”事件接蓝紫色“设置坐标”动作，绿色取值指定从玩家1的蛋仔开始往前、距离5.0的位置。",
      "caption": "官方同类示例：前扑后设置角色坐标，展示事件与动作的连接。",
      "source": "https://u5-creator.s3.game.163.com/manual/mobile/eggycode/eggycode_old.html",
      "width": 669,
      "height": 126
    },
    {
      "id": "if-else",
      "src": "assets/blocks-if-else.png",
      "alt": "跳跃事件下连接紫色如果/否则；橙色条件判断[1,2]随机数是否等于1。真分支把角色坐标设为向前5.0的位置，假分支设为向后5.0的位置。",
      "caption": "官方同类示例：跳跃后随机判断，分别向前或向后传送。",
      "source": "https://u5-creator.s3.game.163.com/manual/mobile/eggycode/eggycode_old.html",
      "width": 926,
      "height": 377
    },
    {
      "id": "repeat",
      "src": "assets/blocks-repeat.png",
      "alt": "跳跃事件下接“重复5次”，循环体创建“方块-可变形”；位置取跳跃者前方，距离使用“当前重复次数”。",
      "caption": "官方同类示例：跳跃后重复创建组件，展示循环内部的动作。",
      "source": "https://u5-creator.s3.game.163.com/manual/mobile/eggycode/eggycode_old.html",
      "width": 905,
      "height": 256
    },
    {
      "id": "delay",
      "src": "assets/blocks-delay.png",
      "alt": "跳跃事件下先接“经过1.0秒执行下列动作”，内部发送“过了1秒”气泡；随后接“经过3.0秒执行下列动作”，内部发送“过了3秒”气泡。两条消息持续时间3.0，隐藏距离30.0。",
      "caption": "官方同类示例：嵌套计时器与消息动作，展示回调连接位置。",
      "source": "https://u5-creator.s3.game.163.com/manual/mobile/eggycode/eggycode_old.html",
      "width": 812,
      "height": 403
    },
    {
      "id": "custom-action-definition",
      "src": "assets/blocks-custom-action-definition.png",
      "alt": "红色自定义积木_1定义包围蓝紫色发送飘字提示动作；接受整数参数“整数0”，转换为字符串，向“获取游戏内所有玩家”发送，持续5.0秒。",
      "caption": "官方同类示例：带整数参数的自定义动作，将参数转换为字符串后发送提示。",
      "source": "https://u5-creator.s3.game.163.com/manual/mobile/eggycode/eggycode_old.html",
      "width": 903,
      "height": 375
    },
    {
      "id": "custom-action-call",
      "src": "assets/blocks-custom-action-call.png",
      "alt": "黄色角色跳跃事件下拼接红色自定义积木_1调用，参数填5。",
      "caption": "官方同类示例：在跳跃事件中调用自定义动作，传入整数5。",
      "source": "https://u5-creator.s3.game.163.com/manual/mobile/eggycode/eggycode_old.html",
      "width": 521,
      "height": 195
    },
    {
      "id": "custom-getter",
      "src": "assets/blocks-custom-getter.png",
      "alt": "红色自定义积木_2定义中有“返回值5.0”，没有复杂计算，也没有调用者积木。",
      "caption": "官方同类示例：自定义获取积木返回定点数5.0。",
      "source": "https://u5-creator.s3.game.163.com/manual/mobile/eggycode/eggycode_old.html",
      "width": 435,
      "height": 245
    },
    {
      "id": "variable-expression",
      "src": "assets/blocks-variable-expression.png",
      "alt": "单条蓝紫色赋值动作：设置粉色全局变量“定点数0” = (5.0 + 定点数1) × 定点数2；绿色算式嵌套两个粉色变量。",
      "caption": "官方同类示例：变量参与表达式计算，展示变量读写和取值。",
      "source": "https://u5-creator.s3.game.163.com/manual/mobile/eggycode/eggycode_old.html",
      "width": 897,
      "height": 86
    },
    {
      "id": "variable-transfer",
      "src": "assets/blocks-variable-transfer.png",
      "alt": "上半图计时器到期（循环）事件每经过1.0秒把整数0设置为[0,99]随机数；下半图跳跃事件将同一个整数0转字符串并发送气泡。",
      "caption": "官方同类示例：跨触发器读取与修改变量，展示变量的连接用法。",
      "source": "https://u5-creator.s3.game.163.com/manual/mobile/eggycode/eggycode_old.html",
      "width": 835,
      "height": 386
    }
  ]
};
