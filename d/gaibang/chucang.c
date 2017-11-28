inherit ROOM;

void create()
{
        set("short", "储藏室");
        set("long", @LONG
这里是丐帮的储藏室，你可以看见一个个锁着的箱子。周
围还悬挂着一些武器和装备。这时有一位丐帮五袋弟子正闭目
养神，看守着这里。
LONG);
        set("exits", ([
                "west" : __DIR__"undertre",
        ]));
        set("objects", ([
                "/d/gaibang/npc/5dai" : 1,
                "/d/gaibang/npc/obj/staff" : 3,
                "/clone/weapon/gangdao" : 2,
        ]));
        setup();
        replace_program(ROOM);
}
