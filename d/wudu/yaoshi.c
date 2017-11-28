inherit ROOM;
string* objs = ({
        __DIR__"obj/fugu",
        __DIR__"obj/chuanxin",
        __DIR__"obj/shexinzi",
        __DIR__"obj/fugu",
        __DIR__"obj/chuanxin",
        __DIR__"obj/shexinzi",
        __DIR__"obj/qianrizui",
});

void create()
{
        set("short", "药室");
        set("long", @LONG
这里是五毒教存放药品的地方，你只见十多个黑漆木柜一字排开，
上面开着数百个的小抽屉，每个抽屉上面都整整齐齐的贴着一行标签。
这里存放着各种珍贵药材，其中大多数是有毒的。旁边一个案上放着
几束刚采来的草药。 
LONG);
        set("exits", ([
                "west" : __DIR__"nanyuan",
        ]));
        set("objects", ([
                objs[random(sizeof(objs))] : 1,
                objs[random(sizeof(objs))] : 1,
                __DIR__"obj/zhulou"        : 2,
        ]));

        setup();
        //replace_program(ROOM);
}
