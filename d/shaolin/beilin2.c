#include <ansi.h> 
inherit ROOM;

int do_move(string arg);
string look_tower();
string look_stone();

void create()
{
	set("short", "西碑林");
	set("long", @LONG
这里是一大片碑林。虽说是碑林，主要是少林历代高僧的佛
塔灵藏 (tower)。一座座佛塔约有二三人高，有汉白玉的，花冈
石的，精工雕凿，薄薄的浮雕面上飞禽走兽，佛谒禅诗，诸佛众
生，可谓无所不包。底座有须弥座的，也有莲花座的，各态纷呈。
佛塔间疏疏落落的立着几块碑(stone)，有的题着几句诗。
LONG );
	set("exits", ([
		"east" : __DIR__"taijie",
	]));
	set("outdoors", "shaolin");
	set("item_desc",([
		"tower"	: (: look_tower :),
		"stone"	: (: look_stone :),
	]));
	set("no_clean_up", 0);
	setup();
}

void init()
{
	add_action("do_move", "move");
}

int do_move(string arg)
{
//      int n;
        object me = this_player();

        if (arg != "stone" || arg == "")
                return 0;

        if (query("exits/down"))
                return notify_fail("佛塔已经被移开了，你还移它作甚？\n");

        message_vision(HIY "$N" HIY "走到佛塔前，运力双掌，使劲推动"
                       "佛塔，打算将它移开。\n" NOR, me);

        if (me->query("max_neili") < 1000)
        {
               message_vision(HIR "结果哪知$N" HIR "内力不济，连吃奶"
                              "的劲都用上了，佛塔还是纹丝不动。\n" NOR, me);
               me->set("neili", 0);
               return 1;
        }

        message_vision(HIY "佛塔忽然发出轧轧的声音，向一侧缓缓移开，"
			"向下露出一个黑洞洞的入口。\n" NOR, me);

        set("exits/down", __DIR__"beilin3");
        me->set("neili", 0);
        set("break", 1);
        return 1;
}

string look_tower()
{
	return WHT
	"\n"
	"    ※※※※※※※※※※※※※※※※※※※※※※\n"
	"    ※※※※　　　　　　　　　　　　　　※※※※\n"
	"    ※※※※　一切世界佛，悉发菩提心，　※※※※\n"
	"    ※※※※　　　　　　　　　　　　　　※※※※\n"
	"    ※※※※　上报四重恩，下济三途苦，　※※※※\n"
	"    ※※※※　　　　　　　　　　　　　　※※※※\n"
	"    ※※※※　无边大法力，渡劫升极乐，　※※※※\n"
	"    ※※※※　　　　　　　　　　　　　　※※※※\n"
	"    ※※※※　愿以此功德，庄严佛净土。　※※※※\n"
	"    ※※※※　　　　　　　　　　　　　　※※※※\n"
	"    ※※※※※※※※※※※※※※※※※※※※※※\n" NOR;
}

string look_stone()
{
	return WHT
	"\n"
	"    ※※※※※※※※※※※※※※※※※※※※※※\n"
	"    ※※※※※※※※※※※※※※※※※※※※※※\n"
	"    ※※※※　　　　　　　　　　　　　　※※※※\n"
	"    ※※※※　清晨入古寺，初日照高林。　※※※※\n"
	"    ※※※※　　　　　　　　　　　　　　※※※※\n"
	"    ※※※※　曲径通幽处，禅房花木深。　※※※※\n"
	"    ※※※※　　　　　　　　　　　　　　※※※※\n"
	"    ※※※※　山光悦鸟性，潭影空人心。　※※※※\n"
	"    ※※※※　　　　　　　　　　　　　　※※※※\n"
	"    ※※※※　万籁此俱寂，惟闻钟磐音。　※※※※\n"
	"    ※※※※　　　　　　　　　　　　　　※※※※\n"
	"    ※※※※※※※※※※※※※※※※※※※※※※\n"
	"    ※※※※※※※※※※※※※※※※※※※※※※\n" NOR;
}
