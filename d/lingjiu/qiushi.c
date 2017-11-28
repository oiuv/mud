inherit ROOM;

void create()
{
        set("short", "囚室");
        set("long", @LONG
这里是「灵鹫宫」关押犯人的地方，屋中光线昏暗，气味
难闻。现在这里静悄悄的，似乎虚竹子当上门主后，这里便比
以前轻静了许多。
LONG);
        set("exits", ([
                "east" : __DIR__"men1",
        ]));

        setup();
        replace_program(ROOM);
}
