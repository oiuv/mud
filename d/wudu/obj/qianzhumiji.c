inherit ITEM;
inherit F_UNIQUE;
#include <ansi.h>

void setup()
{}

void init()
{
        add_action("do_yanjiu", "yanjiu");
        add_action("do_yanjiu", "research");
        add_action("do_du", "du");
}

void create()
{
        set_name(WHT "千蛛万毒手秘笈" NOR, ({ "qianzhu miji", "miji", "book"}));
        set_weight(500);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("material", "paper");
                set("no_sell", 1);
                set("long", WHT
        "这是失传已久的千蛛万毒手秘笈下半部，你可以从中研究一些千蛛万毒手的绝招。\n\n" NOR, );
        }
}

int do_du(string arg)
{
//      string dir;

        if( ! arg || arg == "" ) return 0;

        if( arg == "miji" || arg == "qianzhu miji" || arg == "book" )
        {
                write(HIY "\n秘笈里记载了不少千蛛万毒手的绝招窍门，你可以试着研究研究。\n" NOR);
                return 1;
        }
}

int do_yanjiu(string arg)
{
        object me = this_player();
//      object where = environment(me);
//      object ob;
        string skill, book;
//      int lv;

        if(! arg)
        {
                write("研究千蛛万毒手秘笈指令格式：\n"
                      "research|yanjiu <绝技> from <千蛛万毒手秘笈>\n");
                return 1;
        }
        if(arg == "suck"  || arg == "wan"
        || arg == "zhugu" || arg == "miji"
        || arg == "book"  || arg == "qianzhu miji" )
        {
                write("研究千蛛万毒手秘笈指令格式：\n"
                      "research|yanjiu <绝技> from <千蛛万毒手秘笈>\n");
                return 1;
        }

        if (sscanf(arg, "%s from %s", skill, book) != 2)
        return 0;

        if( me->is_busy())
        {
                write("你现在正忙着呢。\n");
                return 1;
        }

        if( me->is_fighting())
        {
                write("你无法在战斗中专心下来研读新知！\n");
                return 1;
        }

        if( ! me->query_skill("literate", 1) )
        {
                write("你是个文盲，先学点文化(literate)吧。\n");
                return 1;
        }

        if (! id(book))
        {
                write("这里没有这本书。\n");
                return 1;
        }

        if ( skill != "suck"
          && skill != "zhugu"
          && skill != "wan" )
        {
                write(WHT "你可以从千蛛万毒手秘笈里研究到吸毒练功法"
                      "门（suck）、蛛蛊决（zhugu）以及万蛊噬天绝"
                      "技（wan）。\n\n" NOR,);
                return 1;
        }

        if( (int)me->query("jing") < 50 || (int)me->query("qi") < 50 )
        {
                write("你现在过于疲倦，无法专心研读。\n");
                return 1;
        }

        if ( skill == "suck" )
        {
                if (me->query("can_perform/qianzhu-wandushou/suck"))
                {
                        write("你已经学会了千蛛万毒手练毒的窍门。\n");
                        return 1;
                }

                if (me->query("potential") < 1)
                {
                        write("你研读了一会儿，觉得有点迷糊，看来是自己的潜能不够了。\n");
                        return 1;
                }

                message("vision", me->name() + "正专心地研读千蛛万毒手秘笈。\n", environment(me), me);
                tell_object(me, "\n你仔细的研读千蛛万毒手秘笈吸毒练功这一章节。\n");
                me->receive_damage("qi", 30);
                me->receive_damage("jing", 30);
                me->add("potential", -1);
                remove_call_out("suck");
                call_out("suck", 1, me);
                me->start_busy(2);
                return 1;
        }

        if ( skill == "zhugu" )
        {
                if (me->query("can_perform/qianzhu-wandushou/zhugu"))
                {
                        write("你已经学会了「蛛蛊决」这一招。\n");
                        return 1;
                }

                if (me->query("potential") < 1)
                {
                        write("你研读了一会儿，觉得有点迷糊，看来是自己的潜能不够了。\n");
                        return 1;
                }

                message("vision", me->name() + "正专心地研读千蛛万毒手秘笈。\n", environment(me), me);
                tell_object(me, "\n你仔细的研读千蛛万毒手秘笈蛛蛊决这一章节。\n");
                me->receive_damage("qi", 30);
                me->receive_damage("jing", 30);
                me->add("potential", -1);
                remove_call_out("zhugu");
                call_out("zhugu", 1, me);
                me->start_busy(2);
                return 1;
        }

        if ( skill == "wan" )
        {
                if (me->query("can_perform/qianzhu-wandushou/wan"))
                {
                        write("你已经学会了「万蛊噬天」这一招。\n");
                        return 1;
                }

                if (me->query("potential") < 1)
                {
                        write("你研读了一会儿，觉得有点迷糊，看来是自己的潜能不够了。\n");
                        return 1;
                }

                message("vision", me->name() + "正专心地研读千蛛万毒手秘笈。\n", environment(me), me);
                tell_object(me, "\n你仔细的研读千蛛万毒手秘笈万蛊噬天这一章节。\n");
                me->receive_damage("qi", 30);
                me->receive_damage("jing", 30);
                me->add("potential", -1);
                remove_call_out("wan");
                call_out("wan", 1, me);
                me->start_busy(2);
                return 1;
        }
}

int suck(object me)
{
        if( (int)me->query_skill("qianzhu-wandushou", 1) < 100)
        {
                write(HIC "你研读了半天，发现自己对千蛛万毒手领悟不够，无法学会练毒的窍门。\n" NOR);
                return 1;
        }

        if( (int)me->query_skill("hand", 1) < 100)
        {
                write(HIC "你研读了半天，发现自己对基本手法领悟不够，无法学会练毒的窍门。\n" NOR);
                return 1;
        }

        if( (int)me->query_skill("poison", 1) < 100)
        {
                write(HIC "你研读了半天，发现自己对基本毒技领悟不够，无法学会练毒的窍门。\n" NOR);
                return 1;
        }

        if( (int)me->query_skill("force") < 150)
        {
                write(HIC "你研读了半天，发现自己的内功火候太浅，无法学会练毒的窍门。\n" NOR);
                return 1;
        }

        if (me->query("max_neili") < 1000)
        {
                write(HIC "你研读了半天，发现自己的内力修为太浅，无法学会练毒的窍门。\n" NOR);
                return 1;
        }

        if (random(100) > 5)
        {
                write(HIY "你对吸毒练功似有所悟，但还是不够深刻，看来还需继续研读才行。\n" NOR);
                return 1;
        }
   else {
                me->improve_skill("qianzhu-wandushou", 5000000);
                me->improve_skill("poison", 5000000);
                me->set("can_perform/qianzhu-wandushou/suck", 1);
                tell_object(me, HIC "你学会了如何运用千蛛万毒手吸毒练功。\n" NOR);
                write(HIW "\n你仔细研读千蛛万毒手秘笈，终于领悟了吸毒练功的窍门所在。\n" NOR);
                return 1;
        }
}

int zhugu(object me)
{
        if( (int)me->query_skill("qianzhu-wandushou", 1) < 130)
        {
                write(HIC "你研读了半天，发现自己对千蛛万毒手领悟不够，无法学会蛛蛊决。\n" NOR);
                return 1;
        }

        if( (int)me->query_skill("hand", 1) < 130)
        {
                write(HIC "你研读了半天，发现自己对基本手法领悟不够，无法学会蛛蛊决。\n" NOR);
                return 1;
        }

        if( (int)me->query_skill("poison", 1) < 130)
        {
                write(HIC "你研读了半天，发现自己对基本毒技领悟不够，无法学会蛛蛊决。\n" NOR);
                return 1;
        }

        if( (int)me->query_skill("force") < 200)
        {
                write(HIC "你研读了半天，发现自己的内功火候太浅，无法学会蛛蛊决。\n" NOR);
                return 1;
        }

        if (me->query("max_neili") < 1500)
        {
                write(HIC "你研读了半天，发现自己的内力修为太浅，无法学会蛛蛊决。\n" NOR);
                return 1;
        }

        if (random(150) > 5)
        {
                write(HIY "你对蛛蛊决似有所悟，但还是不够深刻，看来还需继续研读才行。\n" NOR);
                return 1;
        }
   else {
                me->improve_skill("qianzhu-wandushou", 5000000);
                me->improve_skill("poison", 5000000);
                me->set("can_perform/qianzhu-wandushou/zhugu", 1);
                tell_object(me, HIC "你学会了「蛛蛊决」这一招。\n" NOR);
                write(HIW "\n你仔细研读千蛛万毒手秘笈，终于领悟了蛛蛊决的窍门所在。\n" NOR);
                return 1;
        }
}

int wan(object me)
{
        if( (int)me->query_skill("qianzhu-wandushou", 1) < 220)
        {
                write(HIC "你研读了半天，发现自己对千蛛万毒手领悟不够，无法学会万蛊噬天。\n" NOR);
                return 1;
        }

        if( (int)me->query_skill("hand", 1) < 220)
        {
                write(HIC "你研读了半天，发现自己对基本手法领悟不够，无法学会万蛊噬天。\n" NOR);
                return 1;
        }

        if( (int)me->query_skill("poison", 1) < 200)
        {
                write(HIC "你研读了半天，发现自己对基本毒技领悟不够，无法学会万蛊噬天。\n" NOR);
                return 1;
        }

        if( (int)me->query_skill("force") < 300)
        {
                write(HIC "你研读了半天，发现自己的内功火候太浅，无法学会万蛊噬天。\n" NOR);
                return 1;
        }

        if (me->query("max_neili") < 3500)
        {
                write(HIC "你研读了半天，发现自己的内力修为太浅，无法学会万蛊噬天。\n" NOR);
                return 1;
        }

        if (random(200) > 5)
        {
                write(HIY "你对万蛊噬天似有所悟，但还是不够深刻，看来还需继续研读才行。\n" NOR);
                return 1;
        }
   else {
                me->improve_skill("qianzhu-wandushou", 5000000);
                me->improve_skill("poison", 5000000);
            me->set("can_perform/qianzhu-wandushou/wan", 1);
                tell_object(me, HIC "你学会了「万蛊噬天」这一招。\n" NOR);
                write(HIW "\n你仔细研读千蛛万毒手秘笈，终于领悟了万蛊噬天的窍门所在。\n" NOR);
                return 1;
        }
}
