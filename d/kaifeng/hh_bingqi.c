inherit ROOM;

void create()
{
        set("short", "兵器房");
        set("long", @LONG
这里是红花会总舵内存放兵器的重地，房里摆满了兵器架
十八般兵刃样样齐全。架子旁边挂着数十副闪闪发光的盔甲
腰带和战靴等物。一位会众正闭目养神，看守着这里。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"hh_guangchang",
	]));
        set("objects", ([
                "/clone/weapon/changjian" : 2,
                "/clone/weapon/gangdao" : 2,
                "/clone/weapon/zhubang" : 2,
        ]));
        setup();
        replace_program(ROOM);
}
