//Room: /d/mingjiao/fangtang.c

inherit ROOM;
string *names = ({
    "/d/items/food/mala_doufu",
    "/d/items/food/bocai_fentiao",
    "/d/items/food/shanhu_baicai",
    "/d/items/food/liuli_qiezi",
    "/d/items/food/cuyu",
    "/d/items/food/dongporou",
    "/d/items/food/longjing_xiaren",
    "/d/items/food/xianli_geng",
    "/d/items/food/jiaohuaji3",
    "/d/items/food/baiguo_bao",
});

void create() {
    set("short", "明教饭堂");
    set("long", @LONG
这里便是明教的饭堂。摆满了长长的餐桌和长凳，几位年轻教
众正来回忙碌着布置。桌上摆了几盆豆腐，花生，青菜以及大鱼，
大肉，鸡，酒等美味食。东边的走廊通向广场。
LONG);
    set("exits", ([ /* sizeof() == 1 */
        "east": __DIR__ "square",
    ]));

    set("objects", ([
        "/d/hangzhou/npc/obj/jiuping": 1,
        names[random(sizeof(names))]: 1,
        names[random(sizeof(names))]: 1,
        names[random(sizeof(names))]: 1,
        names[random(sizeof(names))]: 1,
        names[random(sizeof(names))]: 1,
    ]));
    setup();
    replace_program(ROOM);
}
