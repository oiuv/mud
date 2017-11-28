#include <ansi.h>
#include <room.h>

inherit ROOM;

void create()
{
        set("short", "惊神峰"NOR);
        set("long", @long
你折而向北，又过了一岭，只见古柏三把百余章，皆挺直
端秀，凌霄托根树旁，作花柏顶，灿若云荼。走出十余丈，只
听得琴声之中杂有着无数鸟语，细细的听来，琴声竟似和鸟语
互相应答，间间关关，宛转啼鸣。只见三株大松树下一个白衣
男子背向而坐，膝上放这一张焦尾琴，整自弹奏。他身周树木
上停满了鸟雀，黄莺，杜鹃，喜鹊，八哥，还有许多不知其名
的，和琴声或一问一答，或齐声和唱。
long);
	set("exits", ([
		"south" : __DIR__"sanshengao",
	]));

	set("objects",([
                CLASS_D("kunlun") + "/hezudao" : 1,
    	]));

        set("outdoors", "kunlun");
        setup();
	replace_program(ROOM);
}
