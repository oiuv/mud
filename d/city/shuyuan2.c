// todo 增加经典文学阅读
inherit ROOM;

void create()
{
    set("short", "书院书库");
    set("long", @LONG
这里是书院的图书馆，窗明几净，一尘不染。壁上的书架(shelf)
堆满诸子百家的先贤们的文选，记录了炎黄数千年的风风雨雨和无数
的璀璨传说。
LONG);
    set("item_desc", ([
        "shelf" : "此处已经被衙门查封了。\n",
    ]));
    set("exits", ([
        "down" : __DIR__"shuyuan",
    ]));
    set("no_clean_up", 0);
    setup();

    replace_program(ROOM);
}
