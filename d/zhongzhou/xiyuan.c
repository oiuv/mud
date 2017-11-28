inherit ROOM;

void create()
{
        set("short", "戏院");
        set("long", @LONG
这是戏院的大厅，里面台上唱戏正唱的欢呢。你刚站定就
有两三个彪行大汉来势凶凶上前，不知要发生什么事。
LONG);
        set("exits", ([
                "east" : __DIR__"wendingbei2",
                "south" : __DIR__"liangongfang",
                "west" : __DIR__"xiyuan1",
                "north" : __DIR__"sushe",
        ]));

        set("objects",([
                "/d/beijing/npc/guanzhong" : 3,
        ]));

        setup();
}
