inherit ROOM;

void create()
{
        set("short", "山洞");
        set("long", @LONG
一个黑漆漆的山洞，一眼竟望不到底。两侧的石壁上生满的苔藓，摸起
来又湿又滑。这石洞似乎是人工开凿的，从四周的石壁上仍能看出斧凿的痕
迹。你站在这里，一股恐惧由然而生，似乎身体随时都会被这片黑暗吞噬掉。
LONG
        );
        set("exits", ([
                "out" : __DIR__"dezj",
//                "enter" : __DIR__"dong-2",
]));

        set("objects", ([
               
        ]));

        set("no_clean_up", 0);
        setup();
}