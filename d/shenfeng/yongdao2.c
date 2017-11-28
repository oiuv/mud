inherit ROOM;

void create()
{
        set("short", "甬道");
        set("long", @LONG
走过了长长一条甬道，白玉壁上映出人的影子，此时深入
峰腹，吉凶祸福，殊难逆料，生平遭遇之奇，实以此时为最了。
LONG);
        set("exits", ([
                "north" : __DIR__"yongdao3",
        ]));

        setup();
        replace_program(ROOM);
}
