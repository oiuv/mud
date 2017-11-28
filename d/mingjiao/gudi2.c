#include <ansi.h>;
inherit ROOM;

void create()
{
	set("short", "昆仑谷底");
	set("long", @LONG
你翻过那堵屏风也似的大山壁来到这里，眼前依旧是一片茫茫
云海，山石坚硬无比，你看到右边有一株大松树(tree)，左侧山壁
黑黝黝似乎有个小山洞(dong)。
LONG );
	set("item_desc", ([
		"dong": WHT "一个不知深浅的山洞。\n" NOR,
		"tree": GRN "一株挺拔健硕的松树。\n" NOR,
	]));
	setup();
}

void init()
{
	add_action("do_enter", "enter");
	add_action("do_climb", "climb");
}

int do_enter(string arg)
{
        object ob, me = this_player();
        int n = me->query("age");

        if (! arg || arg != "dong")
        {
                write("你要往哪里去？\n");
                return 1;
        }

        foreach (ob in deep_inventory(me))

        if (ob->is_character())
        {
				if ( ob == me->query_temp( "is_riding" ) )
				{
					message_vision( "$N从$n上飞身跳下。\n", me, ob );
					me->delete_temp( "is_riding" );
					ob->delete_temp( "is_rided_by" );
					ob->move( environment( me ) );
				} else {
					ob->move( environment( me ) );
					message_vision( "\n$N将" + ob->name() + "从背上放了下来"
							"，躺在地上。\n\n" NOR, me );
				}
        }

        message_vision(HIY "$N" HIY "深吸了一口气，慢慢沿着洞壁往里爬"
                       "去。\n\n" NOR, me);

        if (n < 15)
        {
                message_vision(HIW "$N" HIW "爬进数丈，忽见前面透进光"
                       "亮，心中大喜，手足兼施，加速前行。\n\n" NOR, me);
                me->move(__DIR__"gudi3");
        } else
        {
                message_vision(HIR "$N" HIR "行进丈许，洞窟渐窄，再也"
                       "容身不下。$N" HIR "顿时劲运双肩，向前一\n挤，"
                       "身子果然前进了尺许，可是再想前行，却已万万不能"
                       "，坚硬的\n石壁压在他胸口背心，竟然气也喘不过来"
                       "。$N" HIR "窒息难受，只得后退，\n不料身子嵌在"
                       "坚石之中，前进固是不能，后退却也已不得，这一下"
                       "\n$N" HIR "吓得魂飞魄散，竭尽生平之力，双臂向"
                       "石上猛推，身子才退了尺\n许，猛觉得胸口一阵剧痛"
                       "，竟已轧断了一根肋骨。\n\n" NOR, me);
                me->receive_damage("qi", 150);
                me->receive_wound("qi", 100);
        }
        return 1;
}

int do_climb(string arg)
{
        object me = this_player();

        if (! arg || arg != "tree")
        {
                write("你打算往哪里爬？\n");
                return 1;
        }
        message_vision(HIY "$N" HIY "手攀松树，摇了两摇，试试是否结"
                       "实。\n" NOR, me);
        message_vision(HIR "$N" HIR "忽然一个失手，向悬崖下直跌下去"
                       "。\n", me);
        me->move(__DIR__"shanjiao");
        me->unconcious();
        return 1;
}
