// Room: /d/mingjiao/daoshe.c
// Date: Java 97/05/11

#include <room.h>
inherit ROOM;

string look_dui();

void create()
{
    set("short", "道家竹舍");
    set("long", @LONG
走进这间竹舍，一阵香茗醉人，只见几位白衣道人正在
品茶论道，几个青衣小童侍立两旁。中间那位道人中等年纪，
仙风道骨，飘然而立，身后挂有一幅对联(dui lian)，乃是
明教一位先辈李逍遥所书。
LONG );
    set("exits", ([
        "north" : __DIR__"mjfengmen1",
    ]));
    set("item_desc",(["dui lian" : (: look_dui :),]));
    set("no_clean_up", 0);
    set("no_fight", 1);
    set("sleep_room", 1);
    setup();
    //replace_program(ROOM);
}

string look_dui()
{
	return
	"\n"
    "    ※※※※※※※            ※※※※※※※\n"
    "    ※※　　　※※            ※※　　　※※\n"
    "    ※※　山　※※            ※※　水　※※\n"
    "    ※※　　　※※            ※※　　　※※\n"
    "    ※※  色  ※※            ※※  光　※※\n"
    "    ※※　　　※※            ※※　　　※※\n"
    "    ※※  空  ※※            ※※  潋　※※\n"
    "    ※※　　　※※            ※※　　　※※\n"
    "    ※※  蒙  ※※            ※※  滟　※※\n"
    "    ※※　　　※※            ※※　　　※※\n"
    "    ※※　雨　※※            ※※  晴  ※※\n"
    "    ※※　    ※※            ※※      ※※\n"
    "    ※※　亦  ※※            ※※  方  ※※\n"
    "    ※※      ※※            ※※      ※※\n"
    "    ※※  奇  ※※            ※※  好　※※\n"
    "    ※※      ※※            ※※      ※※\n"
    "    ※※※※※※※            ※※※※※※※\n";
}
