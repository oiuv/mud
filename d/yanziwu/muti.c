//ROOM: /d/yanziwu/muti.c

inherit ROOM;

void create()
{
        set("short", "木梯");
        set("long",@LONG
这是一座松树枝架成的木梯，垂下来通往水面。忽听得旁
边柳枝上一只小鸟 "莎莎都莎，莎莎都莎" 的叫了起来，把你
吓了一跳。南边通向船坞。
LONG );
        set("outdoors", "yanziwu");
        set("exits", ([
            "eastup"  : __DIR__"qinyun",
	    "southup" : __DIR__"bozhou",
        ]));
        setup();
        replace_program(ROOM);
}
