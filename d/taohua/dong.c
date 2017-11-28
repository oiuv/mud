inherit ROOM;

void create()
{
        set("short", "山洞");
        set("long", @LONG
你正处在一个小山洞中。这里光线很暗，只能隐隐约约看
出地上有一堆干草。你突然闻到一股难闻的气味，显然是有人
长期住在这里却不打扫的缘故，可是现在没人在这里。
LONG);
        set("exits", ([
                "out"  : __DIR__"road5",
        ]));
        setup();
}
