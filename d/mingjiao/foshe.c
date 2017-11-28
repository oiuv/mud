// Room: /d/mingjiao/foshe.c
// Date: Java 97/05/11

#include <room.h>
inherit ROOM;

string look_fu();

void create()
{
    set("short", "佛家竹舍");
    set("long", @LONG
走进这间竹舍，一阵清香飘来，只见几为青衣僧人端坐
于莆团之上，正低声咏念“金刚经”。室中香烟清绕，竹影
流芳，一白眉老僧端坐正中，手持菩提念珠，念念有词。身
后墙壁之上，高悬一条幅(tiao fu)，纸已发黄,但笔力遒劲，
一见可知是件古物。
LONG );
    set("exits", ([
        "south" : __DIR__"mjfengmen1",
    ]));
    set("item_desc",(["tiao fu" : (: look_fu :),]));
    set("no_clean_up", 0);
    set("sleep_room", 1);
    set("no_fight", 1);
    setup();
    //replace_program(ROOM);
}

string look_fu()
{
	return
	"\n"
	"    ※※※※※※※※※※※※※※※※※※※※※※※※※※\n"
	"    ※※※※※※※　　　　　　　　　　　　※※※※※※※\n"
	"    ※※※※※※※　菩 提 本 非 树，　　　※※※※※※※\n"
	"    ※※※※※※※　　　　　　　　　　　　※※※※※※※\n"
	"    ※※※※※※※  明 镜 亦 非 台，    　※※※※※※※\n"
	"    ※※※※※※※　　　　　　　　　　　　※※※※※※※\n"
	"    ※※※※※※※  本 来 无 一 物，    　※※※※※※※\n"
	"    ※※※※※※※　　　　　　　　　　　　※※※※※※※\n"
	"    ※※※※※※※  何 处 惹 尘 埃。    　※※※※※※※\n"
	"    ※※※※※※※　　　　　　　　　　　　※※※※※※※\n"
	"    ※※※※※※※　　                    ※※※※※※※\n"
	"    ※※※※※※※　     明教  枫舞书     ※※※※※※※\n"
	"    ※※※※※※※　　　　　　　　　　　　※※※※※※※\n"
	"    ※※※※※※※※※※※※※※※※※※※※※※※※※※\n";
}
