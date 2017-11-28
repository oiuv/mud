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
        set_name(CYN "魔尊舍利" NOR, ({"mozun sheli", "sheli"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "个");
                set("long", CYN "一个浑圆的暗色球体，通体透明。这便是传说\n"
                            "中的魔教至宝——魔尊舍利。相传其中蕴藏着\n"
                            "无比巨大的能量，武功高强者可以吸取(xi)其\n"
                            "中的能量来增强功力。\n" NOR);
                set("value", 1000000);
        }
        setup();
}

int do_eat(string arg)
{
        object ob;
        object me = this_player();

        if (!id(arg))
                return notify_fail("你要干什么？\n");

        if( me->is_busy() )
                return notify_fail("你现在正忙着呢。\n");

        if( me->query("power/魔尊舍利") )
                return notify_fail("你已经吸取过一次了，恐怕不能再次经受能量的冲击。\n");

        message_vision (HIY "\n$N" HIY "将双手紧紧贴住魔尊舍利，"
                        "只见一股光芒从中透出，甚至可以看到能"
                        "量在两者间奔流窜动。\n" NOR, me);
        me->start_busy(60);
        remove_call_out("xiqu1");
        call_out("xiqu1", 5, me);
        return 1;
}

void xiqu1(string arg)
{
        object ob;
        object me = this_player();

        message_vision(HIB "\n只见一股光芒从魔尊舍利中流入$N" HIB
                       "的身子……\n" NOR, me);
        remove_call_out("xiqu2");
        call_out("xiqu2", 4, me);
}

void xiqu2(string arg)
{
        object ob;
        object me = this_player();

        message_vision(HIY "\n几许后，又一股光芒从$N" HIY "的身"
                       "体里流出，进入魔尊舍利……\n" NOR, me);
        remove_call_out("xiqu3");
        call_out("xiqu3", 4, me);
}

void xiqu3(string arg)
{
        object ob;
        object me = this_player();

        message_vision(HIR "\n过了一会儿，又是一股光芒从魔尊舍利"
                       "中慢慢流出，流入了$N" HIR "的身体……\n"
                       NOR, me);
        remove_call_out("xiqu4");
        call_out("xiqu4", 4, me);
}

void xiqu4(string arg)
{
        object ob;
        object me = this_player();

        message_vision(MAG "\n随即又见一股光芒从$N" MAG "的身体"
                       "转入魔尊舍利……\n" NOR, me);
        remove_call_out("xiqu5");
        call_out("xiqu5", 4, me);
}

void xiqu5(string arg)
{
        object ob;
        object me = this_player();

        message_vision(HIM "\n刹那间光华暴涨，光芒又从魔尊舍利"
                       "中流到$N" HIM "的身体……\n" NOR, me);
        remove_call_out("xiqu6");
        call_out("xiqu6", 4, me);
}

void xiqu6(string arg)
{
        object ob;
        object me = this_player();

        message_vision(HIW "\n只见$N" HIW "和舍利同时发出无"
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
          && (int)me->query_skill("force") > 330
          && me->query("power/何氏壁") )
        {
                message_vision(HIW "\n光华稍退，犹见$N" HIW "全身晶莹"
                               "剔透，竟发出宝石光泽，似乎已和魔尊舍利"
                               "合为一体了。\n\n" NOR, me);

                me->add("combat_exp", exp);
                me->add("potential", pot);
                me->add("max_neili", li1);
                me->add("max_jingli", li2);
                if (me->query("potential") > me->query_potential_limit()) 
                me->set("potential", me->query_potential_limit());

                tell_object(me, HIY "你感到魔尊舍利中的能量源源不绝的流"
                                "入了你的丹田，顿时有一阵说不出的舒服。\n"
                                NOR);

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
                me->set("power/魔尊舍利", 1);

                tell_object(me, HIC "你获得了" + chinese_number(exp) +
                                "点经验、" + chinese_number(pot) + "点"
                                "潜能、" + chinese_number(li1) + "点最"
                                "大内力和" + chinese_number(li2) + "点"
                                "最\n大精力。\n" NOR);
        } else
        {
                message_vision(HIR "\n只听$N" HIR "一声惨叫，经受不住能"
                               "量的冲击，顿时全身筋脉尽断，鲜血狂喷，身"
                               "体被炸了个粉碎。\n" NOR, me);
                me->set_temp("die_reason", "妄图吸取魔尊舍利，结果全身筋脉尽断而亡。");
                me->die(); 
        }
        message_vision (WHT "\n魔尊舍利上的光华渐渐消逝，变成了一"
                        "堆粉末。\n" NOR, me);
        destruct(this_object());
        return 0;
}

