inherit ROOM;

void create()
{
        set("short", "松树林");
        set("long", @LONG
这里是一片浓密的松树林，前面已经没有了道路，你必须不时砍
断横在你面前的枝桠。不远处一株千年的古松直插云霄，它下面纵横
交错的树根似乎在向人诉说它悠久的岁月。林内光线黑暗，静的能听
到你自己的心跳声，只有你踩在地上厚厚的松针和枯枝上发出的沙沙
声。前面依稀透着一丝光亮，你不由高兴的紧走几步。
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "north" : __DIR__"sl5",
                "west" : __DIR__"sl7",
        ]));

        setup();
        //replace_program(ROOM);
}
