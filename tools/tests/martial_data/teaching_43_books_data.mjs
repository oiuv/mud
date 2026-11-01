// Source-reviewed finite acquisition-to-study routes; no book or grant injection.
export const book43Data = [
  {
    "key": "duan-duanzm-ask-maijing1",
    "teacher": {
      "path": "/kungfu/class/duan/duanzm",
      "id": "duan zhengming",
      "sha256": "56fffaa9a02f08fe164b1b7a981401c6be6e58acef8621e86e6631c1ff7f58ef"
    },
    "entry": {
      "path": "kungfu/class/duan/duanzm.c",
      "sha256": "56fffaa9a02f08fe164b1b7a981401c6be6e58acef8621e86e6631c1ff7f58ef",
      "line": 336,
      "column": 7,
      "start": 9426,
      "end": 10723,
      "function": "ask_maijing1"
    },
    "action": "ask duan zhengming about 王叔和脉经",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 10000,
        "class": "fighter",
        "shen": 10000,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "段氏皇族",
          "master_id": "duan zhengming"
        }
      },
      "skills": {
        "literate": 100,
        "jingluo-xue": 10
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/lonely/book/jingluoxue1",
        "sha256": "c246b7e368f7008ce094422ab1442fae65187895760141134b5b5634e7840149",
        "id": "mai jing",
        "skill": "jingluo-xue",
        "clonep": 0,
        "fields": {
          "exp_required": "10000",
          "jing_cost": "80",
          "difficulty": "50",
          "max_skill": "149",
          "min_skill": "0"
        },
        "jing_range": [
          80,
          80
        ]
      }
    ],
    "limitations": []
  },
  {
    "key": "duan-duanzm-ask-maijing2",
    "teacher": {
      "path": "/kungfu/class/duan/duanzm",
      "id": "duan zhengming",
      "sha256": "56fffaa9a02f08fe164b1b7a981401c6be6e58acef8621e86e6631c1ff7f58ef"
    },
    "entry": {
      "path": "kungfu/class/duan/duanzm.c",
      "sha256": "56fffaa9a02f08fe164b1b7a981401c6be6e58acef8621e86e6631c1ff7f58ef",
      "line": 385,
      "column": 7,
      "start": 10731,
      "end": 12034,
      "function": "ask_maijing2"
    },
    "action": "ask duan zhengming about 玉颧神脉经",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 600000,
        "class": "fighter",
        "shen": 80000,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "段氏皇族",
          "master_id": "duan zhengming"
        }
      },
      "skills": {
        "literate": 100,
        "jingluo-xue": 149
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/lonely/book/jingluoxue2",
        "sha256": "a14849c3eae82a58c4da3b4bb7ecbc11263377104e9484cfdec5916787df5556",
        "id": "yuquan jing",
        "skill": "jingluo-xue",
        "clonep": 0,
        "fields": {
          "exp_required": "600000",
          "jing_cost": "90",
          "difficulty": "65",
          "max_skill": "250",
          "min_skill": "149"
        },
        "jing_range": [
          90,
          90
        ]
      }
    ],
    "limitations": [
      "Book min149/exp600000 is stricter than acquisition exp300000; both apply."
    ]
  },
  {
    "key": "hu-hufei-ask-quanjing",
    "teacher": {
      "path": "/kungfu/class/hu/hufei",
      "id": "hu fei",
      "sha256": "538be69d07e3c9ab4bbd1d6e105c31c79129782a15fbdeef541ac6255768ed41"
    },
    "entry": {
      "path": "kungfu/class/hu/hufei.c",
      "sha256": "538be69d07e3c9ab4bbd1d6e105c31c79129782a15fbdeef541ac6255768ed41",
      "line": 892,
      "column": 7,
      "start": 24637,
      "end": 26009,
      "function": "ask_quanjing"
    },
    "action": "ask hu fei about 胡家拳经",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 10000,
        "class": "fighter",
        "shen": 10000,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "关外胡家",
          "master_id": "hu fei"
        }
      },
      "skills": {
        "literate": 100,
        "hujia-quan": 10,
        "cuff": 20
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/lonely/book/hujia1",
        "sha256": "faa4cc0da533d18b4f961c6953f63ff27691c1c07ceeed3f1d6363917656b21f",
        "id": "hujia quanjing",
        "skill": "hujia-quan",
        "clonep": 0,
        "fields": {
          "exp_required": "10000",
          "jing_cost": "100",
          "difficulty": "40",
          "max_skill": "119",
          "min_skill": "0"
        },
        "jing_range": [
          100,
          100
        ]
      }
    ],
    "limitations": [
      "max_neili>=100; cuff>=20 and >=hujia-quan; empty-handed."
    ]
  },
  {
    "key": "hu-hufei-ask-daopu",
    "teacher": {
      "path": "/kungfu/class/hu/hufei",
      "id": "hu fei",
      "sha256": "538be69d07e3c9ab4bbd1d6e105c31c79129782a15fbdeef541ac6255768ed41"
    },
    "entry": {
      "path": "kungfu/class/hu/hufei.c",
      "sha256": "538be69d07e3c9ab4bbd1d6e105c31c79129782a15fbdeef541ac6255768ed41",
      "line": 942,
      "column": 7,
      "start": 26017,
      "end": 27384,
      "function": "ask_daopu"
    },
    "action": "ask hu fei about 胡家刀谱",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 50000,
        "class": "fighter",
        "shen": 15000,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "关外胡家",
          "master_id": "hu fei"
        }
      },
      "skills": {
        "literate": 100,
        "blade": 10
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/lonely/book/hujia2",
        "sha256": "b7a5cd9fd51fc05d5638ab3e3ad354e62b52ae18aee835ae3377442adecc3166",
        "id": "hujia daopu",
        "skill": "blade",
        "clonep": 0,
        "fields": {
          "exp_required": "30000",
          "jing_cost": "120",
          "difficulty": "70",
          "max_skill": "179",
          "min_skill": "0"
        },
        "jing_range": [
          120,
          120
        ]
      }
    ],
    "limitations": []
  },
  {
    "key": "huashan-linghu-ask-me",
    "teacher": {
      "path": "/kungfu/class/huashan/linghu",
      "id": "linghu chong",
      "sha256": "9c4ac4b24d8f287fef2da2960d274f6ee57258dd4176e25e37b40e638b32415a"
    },
    "entry": {
      "path": "kungfu/class/huashan/linghu.c",
      "sha256": "9c4ac4b24d8f287fef2da2960d274f6ee57258dd4176e25e37b40e638b32415a",
      "line": 113,
      "column": 7,
      "start": 2859,
      "end": 3160,
      "function": "ask_me"
    },
    "action": "ask linghu chong about 琴谱",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 0,
        "class": "fighter",
        "shen": 0,
        "gongxian": 0,
        "weiwang": 0
      },
      "skills": {
        "literate": 100,
        "tanqin-jifa": 10
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/book/qin",
        "sha256": "381ac3207fac3947516ca0936e71b78b90caf79fb1512861c51ed1a1d2d61edd",
        "id": "qin pu",
        "skill": "tanqin-jifa",
        "clonep": 1,
        "fields": {
          "jing_cost": "20",
          "difficulty": "20",
          "max_skill": "150",
          "min_skill": "10"
        },
        "jing_range": [
          20,
          20
        ]
      }
    ],
    "limitations": [
      "No family or shen requirement for book supply. Rawint36 passes tanqin aptitude. No actual musical instrument needed to study."
    ]
  },
  {
    "key": "kunlun-hetaichong-ask-jing",
    "teacher": {
      "path": "/kungfu/class/kunlun/hetaichong",
      "id": "he taichong",
      "sha256": "23d9c435df18fbf94f2e077a43dccae7822f88d554e7d227d1af7af631c298e9"
    },
    "entry": {
      "path": "kungfu/class/kunlun/hetaichong.c",
      "sha256": "23d9c435df18fbf94f2e077a43dccae7822f88d554e7d227d1af7af631c298e9",
      "line": 409,
      "column": 7,
      "start": 11320,
      "end": 12558,
      "function": "ask_jing"
    },
    "action": "ask he taichong about 剑经",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 6400,
        "class": "fighter",
        "shen": 0,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "昆仑派"
        }
      },
      "skills": {
        "literate": 100,
        "xunlei-jian": 10,
        "sword": 30,
        "force": 40
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/lonely/book/xunleijian",
        "sha256": "aa46549634dbd1600d2624ddff639be6fbe418f85fa4f89fcb72b76a9632a0b4",
        "id": "xunlei jianjing",
        "skill": "xunlei-jian",
        "clonep": 0,
        "fields": {
          "jing_cost": "100",
          "difficulty": "30",
          "max_skill": "119",
          "min_skill": "0"
        },
        "jing_range": [
          100,
          100
        ]
      }
    ],
    "limitations": [
      "No force mapping: rawforce40 gives effectiveforce20; rawxunlei10 stays below book max119. rawsword>=special; max_neili>=100.",
      "6400 also supports existing rawforce40 under the usual martial cubic experience cap, not merely reading xunlei10."
    ]
  },
  {
    "key": "miao-miao-ask-jianpu1",
    "teacher": {
      "path": "/kungfu/class/miao/miao",
      "id": "miao renfeng",
      "sha256": "acf54cc38b0713d8daa568b7a7967d49b987b8cc37c800613b96b9ea1a36fa2a"
    },
    "entry": {
      "path": "kungfu/class/miao/miao.c",
      "sha256": "acf54cc38b0713d8daa568b7a7967d49b987b8cc37c800613b96b9ea1a36fa2a",
      "line": 783,
      "column": 7,
      "start": 21154,
      "end": 22512,
      "function": "ask_jianpu1"
    },
    "action": "ask miao renfeng about 剑谱上册",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 10000,
        "class": "fighter",
        "shen": 15000,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "中原苗家",
          "master_id": "miao renfeng"
        }
      },
      "skills": {
        "literate": 100,
        "suqin-beijian": 10,
        "sword": 10
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/lonely/book/miaojia1",
        "sha256": "75a47074881014949723f2909f1e120c338e9f84f8086cb8e51f6f1bedb273c4",
        "id": "miaojia jianpu",
        "skill": "suqin-beijian",
        "clonep": 0,
        "fields": {
          "exp_required": "10000",
          "jing_cost": "100",
          "difficulty": "40",
          "max_skill": "119",
          "min_skill": "0"
        },
        "jing_range": [
          100,
          100
        ]
      }
    ],
    "limitations": [
      "max_neili>=100; sword>=10 and >=suqin. Only upper volume in inventory."
    ]
  },
  {
    "key": "miao-miao-ask-jianpu2",
    "teacher": {
      "path": "/kungfu/class/miao/miao",
      "id": "miao renfeng",
      "sha256": "acf54cc38b0713d8daa568b7a7967d49b987b8cc37c800613b96b9ea1a36fa2a"
    },
    "entry": {
      "path": "kungfu/class/miao/miao.c",
      "sha256": "acf54cc38b0713d8daa568b7a7967d49b987b8cc37c800613b96b9ea1a36fa2a",
      "line": 833,
      "column": 7,
      "start": 22520,
      "end": 23895,
      "function": "ask_jianpu2"
    },
    "action": "ask miao renfeng about 剑谱下册",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 337500,
        "class": "fighter",
        "shen": 50000,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "中原苗家",
          "master_id": "miao renfeng"
        }
      },
      "skills": {
        "literate": 100,
        "sword": 150
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/lonely/book/miaojia2",
        "sha256": "c2f00f142e029c5f938dfe68674de222df1f3d966bea3b4ae7281ce1203674ed",
        "id": "miaojia jianpu",
        "skill": "sword",
        "clonep": 0,
        "fields": {
          "exp_required": "300000",
          "jing_cost": "120",
          "difficulty": "80",
          "max_skill": "199",
          "min_skill": "150"
        },
        "jing_range": [
          120,
          120
        ]
      }
    ],
    "limitations": [
      "At book min rawsword150, martial can_improve_skill requires floor(150^3/10)=337500; teacher/book exp300000 alone cannot study.",
      "Same alias as upper volume; exact acquired object/program required."
    ]
  },
  {
    "key": "ouyang-ouyangfeng-ask-music-book",
    "teacher": {
      "path": "/kungfu/class/ouyang/ouyangfeng",
      "id": "ouyang feng",
      "sha256": "8a049f7c31f5cdd612dd90f9e9e187e3eeb23e6563be841abb4c694def14427b"
    },
    "entry": {
      "path": "kungfu/class/ouyang/ouyangfeng.c",
      "sha256": "8a049f7c31f5cdd612dd90f9e9e187e3eeb23e6563be841abb4c694def14427b",
      "line": 274,
      "column": 7,
      "start": 7858,
      "end": 8173,
      "function": "ask_music_book"
    },
    "action": "ask ouyang feng about 筝谱",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 0,
        "class": "fighter",
        "shen": 0,
        "gongxian": 0,
        "weiwang": 0
      },
      "skills": {
        "literate": 100,
        "guzheng-jifa": 10
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/book/zhengpu",
        "sha256": "b7bf8974646153861a3b9f4f66c4730183931d69c79f444d6c5d6365f3da844f",
        "id": "qin pu",
        "skill": "guzheng-jifa",
        "clonep": 1,
        "fields": {
          "jing_cost": "20",
          "difficulty": "20",
          "max_skill": "150",
          "min_skill": "10"
        },
        "jing_range": [
          20,
          20
        ]
      }
    ],
    "limitations": [
      "No family/shen requirement. Alias is qin pu, not zheng pu. Int36 satisfies guzheng aptitude."
    ]
  },
  {
    "key": "shenlong-lu-ask-me",
    "teacher": {
      "path": "/kungfu/class/shenlong/lu",
      "id": "lu gaoxuan",
      "sha256": "3ac852be158a669dd24d4978ab421896d6fe04d47cfa9d393aa94833fd20ef07"
    },
    "entry": {
      "path": "kungfu/class/shenlong/lu.c",
      "sha256": "3ac852be158a669dd24d4978ab421896d6fe04d47cfa9d393aa94833fd20ef07",
      "line": 95,
      "column": 8,
      "start": 2253,
      "end": 2731,
      "function": "ask_me"
    },
    "action": "ask lu gaoxuan about 秘籍",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 1382400,
        "class": "fighter",
        "shen": 0,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "神龙教"
        }
      },
      "skills": {
        "literate": 100,
        "shenlong-bashi": 20,
        "yixingbu": 10,
        "hand": 80,
        "force": 240
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/book/shoufa",
        "sha256": "712fe6a7279237147c806ccb44208cca64b9944cf1348eda9ce68cc7cd1450cc",
        "id": "shoufa book",
        "skill": "shenlong-bashi",
        "clonep": 1,
        "fields": {
          "exp_required": "10000",
          "jing_cost": "20 + random(30)",
          "difficulty": "40",
          "max_skill": "60",
          "min_skill": "20"
        },
        "jing_range": [
          20,
          49
        ]
      },
      {
        "path": "/clone/book/bufa",
        "sha256": "7794b445f7332eb2ab0d4991cdf7ccedfaf603a9c5c1dc7dd665ace3a5e9518a",
        "id": "bufa book",
        "skill": "yixingbu",
        "clonep": 1,
        "fields": {
          "exp_required": "10000",
          "jing_cost": "20 + random(30)",
          "difficulty": "20",
          "max_skill": "60",
          "min_skill": "10"
        },
        "jing_range": [
          20,
          49
        ]
      }
    ],
    "limitations": [
      "One actual random branch per ask: shoufa vs bufa. This single sparse student can legally study either.",
      "shenlong-bashi valid_learn requires effectiveforce120 (raw240/no mapping), max_neili750, rawhand80 and >=special, empty hands.",
      "Preserve actual random book and its blueprint-time random jing_cost; do not redraw expected cost per read.",
      "1382400 supports the deliberately unmapped rawforce240 prerequisite under usual cubic experience capacity; reading target20 itself only requires10000 book experience."
    ]
  },
  {
    "key": "wudang-guxu-ask-me",
    "teacher": {
      "path": "/kungfu/class/wudang/guxu",
      "id": "guxu daozhang",
      "sha256": "f0ff344f2b041addcf06fb79b306360f0a255399d4499cc9f3b6c824441a84ec"
    },
    "entry": {
      "path": "kungfu/class/wudang/guxu.c",
      "sha256": "f0ff344f2b041addcf06fb79b306360f0a255399d4499cc9f3b6c824441a84ec",
      "line": 87,
      "column": 8,
      "start": 2085,
      "end": 2602,
      "function": "ask_me"
    },
    "action": "ask guxu daozhang about 道德经",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 50000,
        "class": "fighter",
        "shen": 0,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "武当派"
        }
      },
      "skills": {
        "literate": 100,
        "taoism": 0
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/book/daodejing-i",
        "sha256": "085800bf52afdeb9627e1a8dd0b079ba044c0abf9e018fa5c86585dce167b865",
        "id": "jing",
        "skill": "taoism",
        "clonep": 1,
        "fields": {
          "exp_required": "50000",
          "jing_cost": "20 + random(10)",
          "difficulty": "25",
          "max_skill": "99",
          "min_skill": "0"
        },
        "jing_range": [
          20,
          29
        ]
      }
    ],
    "limitations": [
      "Gender male avoids later taoism no-sex constraint. First study at level0 can upgrade to1 and reset learned; validate source arithmetic rather than require positive learned endpoint."
    ]
  },
  {
    "key": "wudang-qingxu-ask-me",
    "teacher": {
      "path": "/kungfu/class/wudang/qingxu",
      "id": "qingxu daozhang",
      "sha256": "17eff1206d2828e3659ed3e525e9644eaeffe3d18dfb83f49bd7ecc433ba4493"
    },
    "entry": {
      "path": "kungfu/class/wudang/qingxu.c",
      "sha256": "17eff1206d2828e3659ed3e525e9644eaeffe3d18dfb83f49bd7ecc433ba4493",
      "line": 70,
      "column": 8,
      "start": 1621,
      "end": 2128,
      "function": "ask_me"
    },
    "action": "ask qingxu daozhang about 道德经",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 150000,
        "class": "fighter",
        "shen": 0,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "武当派"
        }
      },
      "skills": {
        "literate": 100,
        "taoism": 100
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/book/daodejing-ii",
        "sha256": "8b11176a8e8b6075b995c5abc3bfc7d8a76356a810e421c11fb5ed49023c0b9a",
        "id": "jing",
        "skill": "taoism",
        "clonep": 1,
        "fields": {
          "exp_required": "150000",
          "jing_cost": "20 + random(20)",
          "difficulty": "35",
          "max_skill": "179",
          "min_skill": "100"
        },
        "jing_range": [
          20,
          39
        ]
      }
    ],
    "limitations": [
      "Lower volume needs rawtaoism100. Keep upper/lower jing aliases separate per sample."
    ]
  },
  {
    "key": "wudang-song-ask-book1",
    "teacher": {
      "path": "/kungfu/class/wudang/song",
      "id": "song yuanqiao",
      "sha256": "5168ad1378e53a977613b16360bc6141204e5cf95875aa7524173b5b844d25b1"
    },
    "entry": {
      "path": "kungfu/class/wudang/song.c",
      "sha256": "5168ad1378e53a977613b16360bc6141204e5cf95875aa7524173b5b844d25b1",
      "line": 199,
      "column": 7,
      "start": 5524,
      "end": 6655,
      "function": "ask_book1"
    },
    "action": "ask song yuanqiao about 武当药理",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 0,
        "class": "fighter",
        "shen": 10000,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "武当派"
        }
      },
      "skills": {
        "literate": 100,
        "wudang-yaoli": 50,
        "medical": 100
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/lonely/book/wudang",
        "sha256": "7426356ebee4b37dbbf4c8aff4fd393e28575ce77218835a4e31750fff93559f",
        "id": "wudang yaoli",
        "skill": "wudang-yaoli",
        "clonep": 0,
        "fields": {
          "jing_cost": "40",
          "difficulty": "50",
          "max_skill": "149",
          "min_skill": "50"
        },
        "jing_range": [
          40,
          40
        ]
      }
    ],
    "limitations": [
      "Teacher checks yaoli50; actual valid_learn also needs medical100 and >=special."
    ]
  },
  {
    "key": "wudang-song-ask-book2",
    "teacher": {
      "path": "/kungfu/class/wudang/song",
      "id": "song yuanqiao",
      "sha256": "5168ad1378e53a977613b16360bc6141204e5cf95875aa7524173b5b844d25b1"
    },
    "entry": {
      "path": "kungfu/class/wudang/song.c",
      "sha256": "5168ad1378e53a977613b16360bc6141204e5cf95875aa7524173b5b844d25b1",
      "line": 242,
      "column": 7,
      "start": 6663,
      "end": 7140,
      "function": "ask_book2"
    },
    "action": "ask song yuanqiao about 太极十三式",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 100,
        "class": "fighter",
        "shen": 0,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "武当派"
        }
      },
      "skills": {
        "literate": 100,
        "force": 10
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/book/force_book",
        "sha256": "7873a51d36d42f67ce026215efe8b5ba1adc5b312a96a933da58adcfc815be42",
        "id": "shu",
        "skill": "force",
        "clonep": 1,
        "fields": {
          "exp_required": "0",
          "jing_cost": "30",
          "difficulty": "10",
          "max_skill": "30    // the maximum level you can learn"
        },
        "jing_range": [
          30,
          30
        ]
      }
    ],
    "limitations": [
      "Basic force book max30; never inherit a generic rawforce400 setup. rawforce10 requires combat_exp>=100 for can_improve_skill."
    ]
  },
  {
    "key": "wudu-hetieshou-ask-jing",
    "teacher": {
      "path": "/kungfu/class/wudu/hetieshou",
      "id": "he tieshou",
      "sha256": "9e807cef39a4db7a900b1b183daf03555a34dc093a62816af17636ba09a502ec"
    },
    "entry": {
      "path": "kungfu/class/wudu/hetieshou.c",
      "sha256": "9e807cef39a4db7a900b1b183daf03555a34dc093a62816af17636ba09a502ec",
      "line": 625,
      "column": 7,
      "start": 17515,
      "end": 18758,
      "function": "ask_jing"
    },
    "action": "ask he tieshou about 下篇",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 150000,
        "class": "fighter",
        "shen": -30000,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "五毒教"
        }
      },
      "skills": {
        "literate": 100,
        "wudu-qishu": 50,
        "poison": 50
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/lonely/book/dujing3",
        "sha256": "d4ce60a60d8f40ecddac6a45a24131b909a8479b12f49a6fc17a4620f58d4b2b",
        "id": "du jing3",
        "skill": "wudu-qishu",
        "clonep": 0,
        "fields": {
          "exp_required": "150000",
          "jing_cost": "50",
          "difficulty": "50",
          "max_skill": "149",
          "min_skill": "50"
        },
        "jing_range": [
          50,
          50
        ]
      }
    ],
    "limitations": [
      "wudu-qishu consumer additionally needs rawpoison50 and >=special."
    ]
  },
  {
    "key": "wudu-qiyunao-ask-me",
    "teacher": {
      "path": "/kungfu/class/wudu/qiyunao",
      "id": "qi yunao",
      "sha256": "e471180b6e29e86e8865c87cc667401c1917798c7a3a4aeecdaac1f24fd637e6"
    },
    "entry": {
      "path": "kungfu/class/wudu/qiyunao.c",
      "sha256": "e471180b6e29e86e8865c87cc667401c1917798c7a3a4aeecdaac1f24fd637e6",
      "line": 305,
      "column": 7,
      "start": 8550,
      "end": 9784,
      "function": "ask_me"
    },
    "action": "ask qi yunao about 中篇",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 100000,
        "class": "fighter",
        "shen": -10000,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "五毒教"
        }
      },
      "skills": {
        "literate": 100,
        "poison": 50
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/lonely/book/dujing2",
        "sha256": "13c8a73b571a9c3f554690e719437ed1329b41f3b3e44c0f8975ad06293fdb8e",
        "id": "du jing2",
        "skill": "poison",
        "clonep": 0,
        "fields": {
          "exp_required": "100000",
          "jing_cost": "50",
          "difficulty": "50",
          "max_skill": "119",
          "min_skill": "50"
        },
        "jing_range": [
          50,
          50
        ]
      }
    ],
    "limitations": [
      "Poison valid_learn rejects character 光明磊落; common 心狠手辣 is intentional."
    ]
  },
  {
    "key": "xiaoyao-goudu-ask-me-unique-lunyu",
    "teacher": {
      "path": "/kungfu/class/xiaoyao/goudu",
      "id": "gou du",
      "sha256": "74b264b61d7caef2144e8bb88b722a0d950cc273d2975bcad16d0640bfe7515d"
    },
    "entry": {
      "path": "kungfu/class/xiaoyao/goudu.c",
      "sha256": "74b264b61d7caef2144e8bb88b722a0d950cc273d2975bcad16d0640bfe7515d",
      "line": 97,
      "column": 8,
      "start": 2302,
      "end": 3475,
      "function": "ask_me"
    },
    "action": "ask gou du about 论语",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 0,
        "class": "fighter",
        "shen": 0,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "逍遥派",
          "master_id": "wuya zi"
        }
      },
      "skills": {
        "literate": 100
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/book/lbook4",
        "sha256": "6dac19c657b86bfe669ddcb28df0436d346b380a3689ac58745685e536ed2f4a",
        "id": "literate book4",
        "skill": "literate",
        "clonep": 0,
        "fields": {
          "jing_cost": "55",
          "difficulty": "35",
          "max_skill": "149",
          "min_skill": "100"
        },
        "jing_range": [
          55,
          55
        ]
      }
    ],
    "limitations": [
      "Original NPC loads/finds blueprint lbook4; expected clonep0 despite this ordinary BOOK being cloneable in general.",
      "No stock decrement in this branch; precondition singleton has no environment, not pre-held by actor."
    ]
  },
  {
    "key": "xiaoyao-goudu-ask-me-other-mentor-random",
    "teacher": {
      "path": "/kungfu/class/xiaoyao/goudu",
      "id": "gou du",
      "sha256": "74b264b61d7caef2144e8bb88b722a0d950cc273d2975bcad16d0640bfe7515d"
    },
    "entry": {
      "path": "kungfu/class/xiaoyao/goudu.c",
      "sha256": "74b264b61d7caef2144e8bb88b722a0d950cc273d2975bcad16d0640bfe7515d",
      "line": 97,
      "column": 8,
      "start": 2302,
      "end": 3475,
      "function": "ask_me"
    },
    "action": "ask gou du about 论语",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 100000,
        "class": "fighter",
        "shen": 0,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "逍遥派",
          "master_id": "gou du"
        }
      },
      "skills": {
        "literate": 100,
        "strike": 100,
        "hand": 100
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/book/strike_book",
        "sha256": "6a1fb9ab835426f931433d3badc72a94b3218abd3f5b14c85c39c1f99508c202",
        "id": "shu",
        "skill": "strike",
        "clonep": 1,
        "fields": {
          "exp_required": "100000",
          "jing_cost": "20",
          "difficulty": "20",
          "max_skill": "179",
          "min_skill": "100"
        },
        "jing_range": [
          20,
          20
        ]
      },
      {
        "path": "/clone/book/hand_book",
        "sha256": "64873c918e92b6696d82ac304021cfdd85b4f0bdaddd5a8059ec97e07596dfad",
        "id": "shu",
        "skill": "hand",
        "clonep": 1,
        "fields": {
          "exp_required": "100000",
          "jing_cost": "20",
          "difficulty": "20",
          "max_skill": "179",
          "min_skill": "100"
        },
        "jing_range": [
          20,
          20
        ]
      }
    ],
    "limitations": [
      "Random one of strike/hand; both targets initialized100 for min100. Source commented quanpu is not a branch."
    ]
  },
  {
    "key": "xingxiu-ding-ask-me",
    "teacher": {
      "path": "/kungfu/class/xingxiu/ding",
      "id": "ding chunqiu",
      "sha256": "8ee965c0aa83bd260873d504e53ce1c6007355c10b8c4ed92cbcf6d76705024b"
    },
    "entry": {
      "path": "kungfu/class/xingxiu/ding.c",
      "sha256": "8ee965c0aa83bd260873d504e53ce1c6007355c10b8c4ed92cbcf6d76705024b",
      "line": 191,
      "column": 8,
      "start": 4934,
      "end": 5340,
      "function": "ask_me"
    },
    "action": "ask ding chunqiu about 毒经",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 50000,
        "class": "fighter",
        "shen": 0,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "星宿派"
        }
      },
      "skills": {
        "literate": 100,
        "poison": 50
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/book/dujing_2",
        "sha256": "3d88edc1ca313736af5d0918565a7f773cf0867cd8f3057a248e2d7419a965b5",
        "id": "du jing2",
        "skill": "poison",
        "clonep": 1,
        "fields": {
          "exp_required": "50000",
          "jing_cost": "20",
          "difficulty": "25",
          "max_skill": "99",
          "min_skill": "50"
        },
        "jing_range": [
          20,
          20
        ]
      }
    ],
    "limitations": [
      "Teacher has no poison level threshold for the book, but study needs rawpoison50 and non-光明磊落 character."
    ]
  },
  {
    "key": "xingxiu-zhaixing-ask-book",
    "teacher": {
      "path": "/kungfu/class/xingxiu/zhaixing",
      "id": "zhaixing zi",
      "sha256": "c078af00e248edee98c20aea1b2210567e31effaea450a0814d13baafc9d04c5"
    },
    "entry": {
      "path": "kungfu/class/xingxiu/zhaixing.c",
      "sha256": "c078af00e248edee98c20aea1b2210567e31effaea450a0814d13baafc9d04c5",
      "line": 134,
      "column": 8,
      "start": 3420,
      "end": 3823,
      "function": "ask_book"
    },
    "action": "ask zhaixing zi about 秘籍",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 100000,
        "class": "fighter",
        "shen": 0,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "星宿派"
        }
      },
      "skills": {
        "literate": 100,
        "feixing-shu": 10,
        "force": 100,
        "dodge": 80,
        "poison": 30,
        "throwing": 10
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/book/throw_book",
        "sha256": "3d73be9060d8ee494541868b19d88553e70c73c6b47d58aeabb3de8800ea891a",
        "id": "throwing book",
        "skill": "feixing-shu",
        "clonep": 1,
        "fields": {
          "exp_required": "1000",
          "jing_cost": "20 + random(20)",
          "difficulty": "20",
          "max_skill": "99            // the maximum level you can learn",
          "min_skill": "10"
        },
        "jing_range": [
          20,
          39
        ]
      }
    ],
    "limitations": [
      "Actual book teaches feixing-shu, not basic throwing; effectiveforce50,effectivedodge40 with no mappings. query_dex>=25; rawpoison>=30 and >=special; rawthrowing>=special.",
      "100000 also supports existing rawforce100 under usual martial experience capacity; book minimum1000 alone is not a normal full prerequisite learner profile."
    ]
  },
  {
    "key": "xuedao-laozu-ask-book",
    "teacher": {
      "path": "/kungfu/class/xuedao/laozu",
      "id": "xuedao laozu",
      "sha256": "f95e6154b91f0841c6678dcbb6ad678bab01575ca68c3e4302467486aa08512e"
    },
    "entry": {
      "path": "kungfu/class/xuedao/laozu.c",
      "sha256": "f95e6154b91f0841c6678dcbb6ad678bab01575ca68c3e4302467486aa08512e",
      "line": 733,
      "column": 7,
      "start": 20467,
      "end": 21828,
      "function": "ask_book"
    },
    "action": "ask xuedao laozu about 血刀经",
    "actor": {
      "properties": {
        "name": "测试",
        "gender": "男性",
        "character": "心狠手辣",
        "str": 36,
        "int": 36,
        "con": 36,
        "dex": 36,
        "age": 25,
        "qi": 10000,
        "eff_qi": 10000,
        "max_qi": 10000,
        "jing": 10000,
        "eff_jing": 10000,
        "max_jing": 10000,
        "neili": 6000,
        "max_neili": 6000,
        "jingli": 1000,
        "max_jingli": 1000,
        "potential": 10000,
        "learned_points": 0,
        "combat_exp": 300000,
        "class": "fighter",
        "shen": -50000,
        "gongxian": 0,
        "weiwang": 0,
        "family": {
          "family_name": "血刀门",
          "master_id": "xuedao laozu"
        }
      },
      "skills": {
        "literate": 100,
        "xuedao-dafa": 10,
        "force": 120
      },
      "mappings": {},
      "preparations": {}
    },
    "books": [
      {
        "path": "/clone/lonely/book/xuedao",
        "sha256": "5b753f062adf2edb63755f548ec0c39aea913cdc421149ca59de6e761b4cbe94",
        "id": "xuedao jing",
        "skill": "xuedao-dafa",
        "clonep": 0,
        "fields": {
          "exp_required": "300000",
          "jing_cost": "100",
          "difficulty": "80",
          "max_skill": "179",
          "min_skill": "10"
        },
        "jing_range": [
          100,
          100
        ]
      }
    ],
    "limitations": [
      "Actual xuedao valid_learn needs str>=28,dex>=26,rawforce120,max_neili1600; character neither 光明磊落 nor 狡黠多变.",
      "No other special force avoids can_learn compatibility rejection. At target10 no blade>=target clause (only >120). Class is not checked by this book entry; do not invent a class gate."
    ]
  }
];
