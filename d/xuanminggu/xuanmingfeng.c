inherit ROOM;

void create()
{
	set("short", "玄冥峰");
	set("long", @LONG
这里便是玄冥峰了，只见四周白雪覆盖，远处群山却是葱
绿一片。举目四望，但见不远处玄冥谷中炊烟了了，偶有猴子
松鼠之类小生灵忽而跃出，而后又隐没与群山之间。
LONG );
	set("exits", ([
		"southdown"    : __DIR__"shanlu4",
	]));

        set("objects", ([
                "/kungfu/class/xuanming/bai" : 1,
        ]));

	set("outdoors", "xuanming");
	setup();
	replace_program(ROOM);
}
