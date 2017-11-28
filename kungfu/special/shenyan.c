
#include <ansi.h>

inherit F_CLEAN_UP;

int is_scborn() { return 1; }

string name() { return HIC "通慧神眼" NOR; }

int perform(object me, string skill, string arg)
{
        //int i;
      
        object ob;

        if (me->query("neili") < 500)
        	  return notify_fail("你内力不足，无法运用通慧神眼！\n");

        if (me->is_busy()) 
        	  return notify_fail("等你忙完再说吧！\n");
	        
        if (! objectp(ob = present(arg, environment(me))))
                return notify_fail("这里没有这个人！可能是你的格式有错误！\n"
                                   "格式 ： special shenyan <对象id> \n");

	if (ob->query_temp("apply/invisible"))
                return notify_fail("这里没有这个人！可能是你的格式有错误！\n"
                                   "格式 ： special shenyan <对象id> \n");
                                   		
        write(HIW "你施展出通慧神眼之术 ……\n" NOR, me);
	
        me->add("neili", -400);
        me->start_busy(2);

        "/cmds/usr/hp"->main(me, arg, 1);
        "/cmds/skill/cha"->main(me, arg, 1);

        return 1;
}
