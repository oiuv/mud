inherit ROOM;

void create()
{
        set("short", "醉仙楼三楼");
        set("long", @LONG
这里是三楼，一上来就觉得喧闹无比，和二楼的清雅恰成
反比，简直让你不能相信。几张原本干净整洁的桌子也被糟蹋
的一塌糊涂。汤水淌得满地，酒呃臭屁满屋都是。地上还有残
留的血迹。
LONG);

        set("objects", ([
                __DIR__"npc/tao1" : 1,
                __DIR__"npc/tao2" : 1,
                __DIR__"npc/tao3" : 1,
                __DIR__"npc/tao4" : 1,
                __DIR__"npc/tao5" : 1,
                __DIR__"npc/tao6" : 1,
        ]));

        set("exits", ([
                "down" : __DIR__"zuixianlou2",
        ]));
        setup();
	replace_program(ROOM);
}
