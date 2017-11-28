// Room: /d/village/bighouse1.c

inherit ROOM;

void create()
{
        set("short", "前厅");
	set("long", @LONG
这是一间很普通的青砖瓦房，但在这个小村子里已是首屈一指的“豪
宅”了。这里是前厅，厅里的摆设很简单，乡下土财主都很财迷，就算有
几个钱儿，也是舍不得花。东边是个小门通向内室。
LONG );
        set("exits", ([ /* sizeof() == 2 */
            "west" :__DIR__"sroad4",
            "east" :__DIR__"bighouse2",
        ]));

        setup();
        replace_program(ROOM);
}
 
