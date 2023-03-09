export const testDataDemo={
  "id": "4",
  "name": "项目B-模型1",
  "type": "risk_package",
  "children": [
    {
      "id": "f7337ec6-55b7-4a12-b28a-7fef3eb51b5b",
      "operator": "or",
      "children": [
        {
          "id": "26",
          "name": "规则 1++++",
          "remark": "规则备注说明",
          "expression": "28  and  29 ",
          "type": "strategy",
          "children": [
            {
              "id": "bf033d37-bd11-41f2-842c-73f0d6b4a829",
              "operator": "and",
              "children": [
                {
                  "id": "28",
                  "name": "风控集1",
                  "remark": "备注说明风控集",
                  "expression": " (  1 and 2  ) or  3 ",
                  "type": "risk_list",
                  "children": [
                    {
                      "id": "12b2672e-3d46-4ad9-9dcc-f1a409c53eeb",
                      "operator": "or",
                      "children": [
                        {
                          "id": "e74d18d2-e925-4639-b5e8-a0f593f105ab",
                          "children": [
                            {
                              "id": "bbca1d85-3699-4112-9dc1-46487d63c54e",
                              "operator": "and",
                              "children": [
                                {
                                  "id": "1",
                                  "name": "企业信息 包含 德邦",
                                  "expression": "true",
                                  "type": "rule"
                                },
                                {
                                  "id": "2",
                                  "name": "销量>50",
                                  "expression": "true",
                                  "type": "rule"
                                }
                              ]
                            }
                          ]
                        },
                        {
                          "id": "3",
                          "name": "利润>10",
                          "expression": "false",
                          "type": "rule"
                        }
                      ]
                    }
                  ]
                },
                {
                  "id": "29",
                  "name": "风控集2",
                  "remark": "备注说明风控集",
                  "expression": "4",
                  "type": "risk_list",
                  "children": [
                    {
                      "id": "4",
                      "name": "销售时间 在 [ 2020-11-26 00:00:00]和 [ 2020-11-30 00:00:00] 之间",
                      "expression": "false",
                      "type": "rule"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "30",
          "name": "规则2",
          "remark": "规则备注说明",
          "expression": "31 or 32",
          "type": "strategy",
          "children": [
            {
              "id": "cfce61cc-78ff-47ab-8340-d2221f3875e6",
              "operator": "or",
              "children": [
                {
                  "id": "31",
                  "name": "风控集3",
                  "remark": "风控集注说明",
                  "expression": "5",
                  "type": "risk_list",
                  "children": [
                    {
                      "id": "5",
                      "name": "缓存日期 > 30 ",
                      "expression": "true",
                      "type": "rule"
                    }
                  ]
                },
                {
                  "id": "32",
                  "name": "风控集4",
                  "remark": "备注说明风控集",
                  "expression": "6",
                  "type": "risk_list",
                  "children": [
                    {
                      "id": "6",
                      "name": "企业人数 > 50 ",
                      "expression": "true",
                      "type": "rule"
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
      "id": "afcd18fb-ff0e-47cd-bdce-fc6ba415e5c2",
      "operator": "and",
      "children": [
        {
          "id": "30",
          "name": "规则2",
          "remark": "规则备注说明",
          "expression": "31 or 32",
          "type": "strategy",
          "children": [
            {
              "id": "e6d122af-78b3-4062-85fa-f3fd536a5b03",
              "operator": "or",
              "children": [
                {
                  "id": "31",
                  "name": "风控集3",
                  "remark": "风控集注说明",
                  "expression": "5",
                  "type": "risk_list",
                  "children": [
                    {
                      "id": "5",
                      "name": "缓存日期 > 30 ",
                      "expression": "true",
                      "type": "rule"
                    }
                  ]
                },
                {
                  "id": "32",
                  "name": "风控集4",
                  "remark": "备注说明风控集",
                  "expression": "6",
                  "type": "risk_list",
                  "children": [
                    {
                      "id": "6",
                      "name": "企业人数 > 50 ",
                      "expression": "true",
                      "type": "rule"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "33",
          "name": "规则 3++",
          "remark": "规则3备注说明",
          "expression": "35",
          "type": "strategy",
          "children": [
            {
              "id": "35",
              "name": "风控集 5++",
              "remark": "风控集5备注说明",
              "expression": "10",
              "type": "risk_list",
              "children": [
                {
                  "id": "10",
                  "name": "月份 在 [1,3,5,6,8] 之内",
                  "type": "rule"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
