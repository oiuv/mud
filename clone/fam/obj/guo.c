
//许愿无花果 指定一项天赋失败 减一点

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIR "许愿无花果" NOR, ({ "wuhua guo", "guo"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIC "传说中的仙果，先wish再eat，"+
                                     "据说能帮人消除以往吃丹失败的痛苦经历！\n" NOR);
                set("unit", "粒");
                set("value", 10);
                set("no_sell",1);
                set("weight", 10);                
             }
        setup();
}

void init()
        {       
                add_action("do_wish","wish");
                add_action("do_eat","eat");
        }
                
int do_wish( string arg )

        {       object me; 
                me = this_player();

                me->set_temp("wish_sub_tianfu1", arg);  
            if (arg == "臂力" || arg == "str")
                { if (me->query("gift/str/fail") == 0)
                  return notify_fail("你的臂力没有失败记录呀！\n");
                  me->set_temp("wish_sub_tianfu", "str");
                  write("你指定了要减一点"HIY+ arg + NOR"的失败记录。\n");
                  return 1;}

            if (arg == "悟性" || arg == "int")
                { if (me->query("gift/int/fail") == 0)
                  return notify_fail("你的悟性没有失败记录呀！\n");
                  me->set_temp("wish_sub_tianfu", "int");
                  write("你指定了要减一点"HIW+ arg + NOR"的失败记录。\n");
                  return 1;}

            if (arg == "根骨" || arg == "con")
                { if (me->query("gift/con/fail") == 0)
                  return notify_fail("你的根骨没有失败记录呀！\n");
                  me->set_temp("wish_sub_tianfu", "con");
                  write("你指定了要减一点"YEL+ arg + NOR"的失败记录。\n");
                  return 1;}

            if (arg == "身法" || arg == "dex")
                { if (me->query("gift/dex/fail") == 0)
                  return notify_fail("你的身法没有失败记录呀！\n");
                  me->set_temp("wish_sub_tianfu", "dex");
                  write("你指定了要减一点"HIR+ arg + NOR"的失败记录。\n");
                  return 1;}            

            else { write("你要减哪项天赋的失败？比如wish 臂力或者wish str\n");}         
            return 1;
        }

int do_eat( string arg )
{       
        if (arg == "wuhua guo" || arg == "guo")

        {                
         object me;
        
         me = this_player();

        if (me->query_temp("wish_sub_tianfu") == 0 )
        {write(HIR"请先用wish <天赋> 指定你要减哪项天赋的失败记录！\n"NOR);return 1;}

         
         log_file("static/yuanxiao", sprintf("%s(%s) eat 无花果 at %s.\n",
                 me->name(1), me->query("id"), ctime(time())));
        message_vision(HIR "$N一口将无花果吞下了肚子，“咕噜噜”地放了个臭屁。\n" NOR, me);
         write(HIG"你的" + me->query_temp("wish_sub_tianfu1") + 
                "的失败记录减少了一点。\n"NOR);
        if ( me->query("gift/" + me->query_temp("wish_sub_tianfu") + "/all") > 10 )
         me->set("gift/" + me->query_temp("wish_sub_tianfu") + "/all" , 10); 

         me->add("gift/" + me->query_temp("wish_sub_tianfu") + "/fail", -1);
         me->add("gift/" + me->query_temp("wish_sub_tianfu") + "/all", -1);
		 me->add("gift/gift_all", -1);
        
         me->delete_temp("wish_sub_tianfu");
         me->delete_temp("wish_sub_tianfu1");

         destruct(this_object());
         return 1;
        }
else {  return 0;}
}
                
int query_autoload() 
{ return 1; }


        
