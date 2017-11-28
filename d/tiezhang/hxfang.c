// Room: /u/zqb/tiezhang/hxfang.c

inherit ROOM;

void create()
{
	set("short", "后厢房");
	set("long", @LONG
这是大厅后面的一个小房间，虽然也是岩石砌成，但是却布置的非常舒
适。四壁用挂毯遮住，不露一点石壁的痕迹。屋内转圈摆放了一些椅子，上
面铺着厚厚的软垫，坐上去一定很舒适。这里是帮主处理帮中日常事务的地
方。后面通向后花院。
LONG	);
	set("exits", ([ /* sizeof() == 2 */
            "north" : __DIR__"hhyuan-1",
            "south" : __DIR__"wztang",
        ]));
	 set("objects", ([
            __DIR__"npc/yahuan" : 1,
        ]));

        set("no_clean_up", 0);

	setup();
	replace_program(ROOM);
}
