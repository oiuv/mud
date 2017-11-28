#include <ansi.h>
inherit ITEM;

void setup()
{}

void init()
{
        add_action("do_eat", "xi");
}

void create()
{
        set_name(HIW "何氏壁" NOR, ({"heshi bi", "heshi", "bi"}));
        set_weight(10000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "一块晶莹剔透的宝玉，其中一角镶嵌着一块黄\n"
                                "金，宝玉上雕刻着盘龙，这便是传说可以号令\n"
                                "天下的何氏壁。相传宝玉中蕴藏着奇异的能源，\n"
                                "武功高强者可以吸取(xi)其中的能量来增强功\n"
                                "力。\n" NOR);
                set("value", 3000000);
                set("unit", "块");
                set("item_origin", 1);
                set("material_attrib", "heshi bi");
                set("material_name", HIW "何氏壁" NOR);
                set("can_make", "all");
                set("not_make", ({ "鞭", "甲"}));
                set("power_point", 80);
        }
}

int do_eat(string arg)
{
        object ob;
        object me = this_player();

        if (!id(arg))
                return notify_fail("你要干什么？\n");

        if( me->is_busy() )
                return notify_fail("你现在正忙着呢。\n");

        if( me->query("power/何氏壁") )
                return notify_fail("你已经吸取过一次了，恐怕不能再次经受能量的冲击。\n");

        message_vision (HIW "\n$N" HIW "将双手紧紧贴住何氏壁一侧，"
                        "只见一股白色光芒从宝玉中澎湃而出，夺目"
                        "的光华将四周照射得一片明亮。\n" NOR, me);
        me->start_busy(60);
        remove_call_out("xiqu1");
        call_out("xiqu1", 5, me);
        return 1;
}

void xiqu1(string arg)
{
        object ob;
        object me = this_player();

        message_vision(HIW "\n只见一股光芒从何氏壁中流入$N" HIW
                       "的身子……\n" NOR, me);
        remove_call_out("xiqu2");
        call_out("xiqu2", 4, me);
}

void xiqu2(string arg)
{
        object ob;
        object me = this_player();

        message_vision(HIW "\n几许后，又一股光芒从$N" HIW "的身"
                       "体里流出，进入何氏壁……\n" NOR, me);
        remove_call_out("xiqu3");
        call_out("xiqu3", 4, me);
}

void xiqu3(string arg)
{
        object ob;
        object me = this_player();

        message_vision(HIW "\n过了一会儿，又是一股光芒从何氏壁"
                       "中慢慢流出，流入了$N" HIW "的身体……\n"
                       NOR, me);
        remove_call_out("xiqu4");
        call_out("xiqu4", 4, me);
}

void xiqu4(string arg)
{
        object ob;
        object me = this_player();

        message_vision(HIW "\n随即又见一股光芒从$N" HIW "的身体"
                       "转入何氏壁……\n" NOR, me);
        remove_call_out("xiqu5");
        call_out("xiqu5", 4, me);
}

void xiqu5(string arg)
{
        object ob;
        object me = this_player();

        message_vision(HIW "\n刹那间光华暴涨，光芒又从何氏壁"
                       "中流到$N" HIW "的身体……\n" NOR, me);
        remove_call_out("xiqu6");
        call_out("xiqu6", 4, me);
}

void xiqu6(string arg)
{
        object ob;
        object me = this_player();

        message_vision(HIY "\n只见$N" HIY "和何氏壁同时发出无"
                        "比耀眼的光华。刹那间空气炽热，几欲"
                        "沸腾，仿佛连天地都快被烧焦一般……\n" NOR, me);
        remove_call_out("xiqu7");
        call_out("xiqu7", 2, me);
}

void xiqu7(string arg)
{
        object ob;
        object me = this_player();
        int exp, pot, li1, li2, max;

        exp = 30000 + random(10000);
        pot = 5000 + random(3000);
        li1 = 300 + random(100);
        li2 = 300 + random(100);

        if ( me->query("max_neili") > 5000
          && me->query("max_jingli") > 1200
          && me->query("combat_exp") > 2000000
          && (int)me->query_skill("force") > 330)
        {
                message_vision(HIC "\n光华稍退，犹见$N" HIC "全身晶莹"
                               "剔透，竟发出宝石光泽，似乎已和何氏壁"
                               "合为一体了。\n\n" NOR, me);

                me->add("combat_exp", exp);
                me->add("potential", pot);
                me->add("max_neili", li1);
                me->add("max_jingli", li2);
                if (me->query("potential") > me->query_potential_limit()) 
                me->set("potential", me->query_potential_limit());

                tell_object(me, HIY "你感到何氏壁中的能量源源不绝的流"
                                "入了你的丹田，全身暖洋洋的，说不出的"
                                "舒服受用。\n" NOR); 

                me->improve_skill("force", 20000);
                max = me->query("max_qi");
                me->set("eff_qi", max);
                me->set("qi", max);
                max = me->query("max_jing");
                me->set("eff_jing", max);
                me->set("jing", max);
                me->set("neili", me->query("max_neili"));
                me->set("jingli", me->query("max_jingli"));

                max = me->max_food_capacity();
                me->set("food", max);
                max = me->max_water_capacity();  
                me->set("water", max);
                me->clear_condition();
                me->set("power/何氏壁", 1);

                tell_object(me, HIC "你获得了" + chinese_number(exp) +
                                "点经验、" + chinese_number(pot) + "点"
                                "潜能、" + chinese_number(li1) + "点最"
                                "大内力和\n" + chinese_number(li2) + "点"
                                "最大精力。\n" NOR);
        } else
        {
                message_vision(HIR "\n只听$N" HIR "一声惨叫，经受不住能"
                               "量的冲击，顿时全身筋脉尽断，鲜血狂喷，身"
                               "体被炸了个粉碎。\n" NOR, me);
                me->set_temp("die_reason", "妄图吸取何氏壁，结果全身筋脉尽断而亡。");
                me->die(); 
        }
        message_vision (WHT "\n何氏壁上的光华渐渐消逝，变成了一"
                        "堆粉末。\n" NOR, me);
        destruct(this_object());
        return 0;
}

