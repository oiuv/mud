inherit ROOM;

void create()
{
        set("short", "兵器库");
        set("long", @LONG
这里是马庄内存放兵器的重地，房里摆满了兵器架十八般
兵刃样样齐全。架子旁边挂着数十副闪闪发光的盔甲腰带和战
靴等物。一位丐帮五袋弟子正闭目养神，看守着这里。
LONG);
        set("exits", ([
                "east"  : __DIR__"ma_lianwu1",
        ]));
        set("objects", ([
                "/d/gaibang/npc/5dai" : 1,
                "/d/gaibang/npc/obj/staff" : 3,
                "/clone/weapon/changjian" : 2,
                "/clone/weapon/gangdao" : 2,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
