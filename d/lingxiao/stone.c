inherit ROOM;

void create()
{
        set("short", "云海石");
        set("long", @LONG
这里放着一座硕大的石头。乃是白自在从雪山绝谷中找到的
奇石。只见上面云气缭绕，布满了一些奇形怪状的花纹。听说在
要下雨的时候，还会散发出不同形状的云雾，缭绕奇石四周，经
久不散，是白自在最喜欢来赏玩的宝物。
LONG );
        set("outdoors", "lingxiao");
        set("exits", ([
            	"east" : __DIR__"meiroad2",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}