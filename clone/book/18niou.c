#include <ansi.h>
inherit BOOK;

#define MUOU    "/clone/lonely/book/18muou"

void create()
{
        set_name(NOR + WHT "十八泥偶" NOR, ({ "18 niou", "18", "niou" }));
        set_weight(600);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "盒");
                set("long", NOR + WHT "
这是一个小木盒，盒中垫着棉花，并列着三排泥制玩偶，每排
六个，共是一十八个。玩偶制作得非常精巧，每个都是裸体的
男人，皮肤上涂了白垩，画满了条条红线，更有无数黑点，都
是脉络和穴道的方位。似乎都是和内功心法有关。\n" NOR);
                set("value", 5000);
                set("no_sell", "你家的孩子死了？玩具也拿来卖钱。");
                set("material", "wood");
                set("skill", ([
                        "name"         : "force",
                        "exp_required" : 1000,
                        "jing_cost"    : 30,
                        "difficulty"   : 30,
                        "max_skill"    : 99,
                        "min_skill"    : 20
                ]));
        }
}

void init()
{
        add_action("do_nie", "nie");
}

int do_nie(string arg)
{
        object me, ob;
//      object where;

        me = this_player();

        if (! arg || ! id(arg))
                return 0;

        ob = find_object(MUOU);
        if (! ob) ob = load_object(MUOU);

        if (! environment(ob))
        {
                ob->move(me, 1);
                message_sort(HIW "\n只见$N轻轻一捏手中的泥偶，听得刷刷刷"
                             "几声，裹在泥人外面的粉饰、油彩和泥底纷纷掉"
                             "落。$N心感可惜，却见泥粉褪落处里面又有一层"
                             "油漆的木面。索性再将泥粉剥落一些，里面依稀"
                             "现出人形，当下再将泥人身上的泥粉尽数剥去，"
                             "竟露出一个裸体的木偶来。木偶身上油着层桐油"
                             "，绘满黑线，却无穴道位置。木偶刻工精巧，面"
                             "目栩栩如生，双手捧腹张嘴作笑状，神态滑稽之"
                             "极，相貌和本来的泥人截然不同。\n\n" NOR, me);
        } else
        {
                message_sort(HIR "\n$N轻轻一捏手中的泥偶，听得刷刷几声，"
                             "裹在泥人外面的粉饰油彩和泥底纷纷掉落，整个"
                             "泥偶化作了一块块烂泥。$N不禁连连叹息。原想"
                             "其中可能另藏乾坤，没想到竟然白白糟蹋了宝物"
                             "。\n\n" NOR, me);
        }
        destruct(this_object());
        return 1;
}