inherit ROOM;

void create()
{
        set("short", "走廊");
        set("long", @LONG
这是一条通往万安寺大殿的木制走廊，走廊里静悄悄的，没什么人走动。
前面便是万安寺的大殿了。大厅上灯火通明，非常的宽敞明亮。
LONG );
        set("exits", ([
                "north" : __DIR__"was_dadian",
                "south" : __DIR__"was_zoulang1",
        ]));

        setup();
}

