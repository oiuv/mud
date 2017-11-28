// Room: /d/mingjiao/mjdimen1.c
// Date: Java 97/05/11

#include <room.h>
inherit ROOM;

string look_pai();

void create()
{
    set("short", "门口");
    set("long", @LONG
前面就是明教的“地字门”了，这里是明教中女弟子修炼
的地方，从门口看进去，绫罗幔影，身姿绰绰。虽是江湖儿女，
却也不让男子随意进入。门口还立有一块木牌(mu pai)。
LONG );
    set("exits", ([
        "enter" : __DIR__"nushe",
        "southwest" : __DIR__"mjdimen",
    ]));
    set("item_desc",(["mu pai" : (: look_pai :),]));
    set("outdoors", "mingjiao");
    set("no_clean_up", 0);
    setup();
//    replace_program(ROOM);
}

string look_pai()
{
	return
	"\n"
	"※※※※※※※※※※※※※※※※※※\n"
	"※                                ※\n"
	"※  擅闯女舍者，投入碧水寒潭受罚。※\n"
	"※                                ※\n"
        "※         明教刑堂堂主冷谦 立    ※\n"
	"※                                ※\n"
	"※※※※※※※※※※※※※※※※※※\n";

}
