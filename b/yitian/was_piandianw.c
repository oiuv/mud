inherit ROOM;

void create()
{
        set("short", "偏殿");
        set("long", @LONG
这里是万安寺的偏殿，本是万安寺众僧参禅之处，地上只摆着几个蒲团。
大台上供着十八罗汉中的九个罗汉，一个个是金光闪闪，栩栩如生。
LONG );
        set("exits", ([
                "east" : __DIR__"was_dadian",
        ]));

        setup();
}

