inherit ROOM;

void create()
{
        set("short", "南门兜");
        set("long", @LONG
南门兜中央一株巨大古榕，根繁叶茂，浓荫遮盖树亩，将
整个街口遮闭严实不漏日光。在树阴下乘凉，甚为舒适。
LONG);
        set("exits", ([
                "north"  : __DIR__"nandajie",
                "south"  : __DIR__"nanmen",
                "west"   : __DIR__"shiqiao",
                "east"   : __DIR__"xiaochang",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

