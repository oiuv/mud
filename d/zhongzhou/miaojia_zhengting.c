inherit ROOM;

void create()
{
	set("short", "苗家正厅");
	set("long", @LONG
这里是苗家的正厅，厅内非常的宽敞明亮。正中摆放着张
八仙桌，四周墙壁上挂着一些字画。两个中年男子坐在大厅的
中央，用着鄂北方言大声谈论着些什么。
LONG);
	set("exits", ([
  		"west"  : __DIR__"miaojia_dayuan",
  		"east"  : __DIR__"miaojia_zoulang1",
  		"north" : __DIR__"miaojia_xiangfang1",
  		"south" : __DIR__"miaojia_xiangfang2",
	]));
        set("objects", ([
                CLASS_D("miao") + "/ying" : 1,
                CLASS_D("miao") + "/neng" : 1,
        ]));
	set("no_clean_up", 0);
	setup();
        replace_program(ROOM);
}
