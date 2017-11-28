// make.c

#include <ansi.h>
#include <medical.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object qm;
        object hob;
        string med;
        mapping make;
        mapping req;
        mapping herb;
        string *ks;
        object *hlist;
        string msg;
        int only_list;
        int i;

        if (! arg)
        {
                make = me->query("can_make");
                if (! mapp(make))
                        return notify_fail("你现在不会制任何药物。\n");

                ks = keys(make);
                msg = "你现在已经会制";
                if (sizeof(ks) >= 2)
                        msg += implode(ks[0..sizeof(ks) - 2], "、") +
                                "和" + ks[sizeof(ks) - 1] + "了。\n";
                else
                        msg += ks[0] + "了。\n";
                msg = sort_string(msg, 64);
                write(msg);
                return 1;
        }

        // only for list?
        only_list = sscanf(arg, "%s ?", arg);

        if (! stringp(med = me->query("can_make/" + arg)))
                return notify_fail("你还不会配这种药啊！\n");

        // The player can only make the medicine under the /clone/medicine,
        // nothing, but for save memory.
        med = MEDICINE(med);
        if (file_size(med + ".c") < 0)
                return notify_fail("这种药方好像已经失传了？你还是问问巫师吧。\n");

        if (! mapp(req = med->query("mixture")))
                return notify_fail(med->name() + "好像无法配制...\n");

        if (! mapp(herb = req["herb"]))
                return notify_fail(med->name() + "需要什么原料呢...\n");

        if (only_list)
        {
                // show herb
                write("炼制" + arg + "需要以下这些药材：\n");
                ks = keys(herb);
                for (i = 0; i < sizeof(ks); i++)
                {
                        write(chinese_number(herb[ks[i]]) + HERB(ks[i])->query("base_unit") +
                              HERB(ks[i])->name() + "\n");
                }
                return 1;
        }

        if (me->is_fighting())
                return notify_fail("打架的时候你还有闲工夫配药？\n");

        if (me->is_busy())
                return notify_fail("还是先把手头的事情忙完吧。\n");

        if (environment(me)->query("no_fight") && 0)
                return notify_fail("你在这里制药只怕要打扰到别人。\n");

        qm = me->query_temp("handing");
        if (! qm)
                return notify_fail("你的先把能够磨药的研钵拿(hand)在手上才行。\n");

        if (! qm->can_make_medicine())
                return notify_fail(qm->name() + "好像无法发挥研钵的作用吧。\n");

        if (sizeof(all_inventory(qm)) > 0)
                return notify_fail("你还是先把" + qm->name() + "里面的东西拿出来再说。\n");

        if (me->query("jing") < me->query("max_jing") * 7 / 10)
                return notify_fail("你现在精神难以集中，无法配药。\n");

        ks = keys(req) - ({ "herb", "neili", "jing", "jingli", "min_level", "time" });

        // check skills
        for (i = 0; i < sizeof(ks); i++)
                if (me->query_skill(ks[i], 1) < req[ks[i]])
                        return notify_fail("你的" + to_chinese(ks[i]) +
                                           "水平不够，还无法调剂" +
                                           med->name() + "。\n");

        // check herb
        ks = keys(herb);
        hlist = allocate(sizeof(ks));
        for (i = 0; i < sizeof(ks); i++)
        {
                hob = present("herb_" + ks[i], me);
                if (! hob || hob->query_amount() < herb[ks[i]])
                {
			if (file_size(HERB(ks[i]) + ".c") < 0)
			{
				write("没有(" + ks[i] + ")这种药材啊！"
				      "怎么回事？\n");
				return 1;
			}
                        return notify_fail("你点了点药材，发现" +
                                           HERB(ks[i])->name() +
                                           "的分量还不够。\n");
                }
                hlist[i] = hob;
        }

        // decrease herb
        msg = "你选出";
        for (i = 0; i < sizeof(ks); i++)
        {
                if (i) msg += "、";
                msg += chinese_number(herb[ks[i]]) +
                       hlist[i]->query("base_unit") +
                       hlist[i]->name();
                hlist[i]->add_amount(-herb[ks[i]]);
        }
        msg += "，然后小心翼翼的把它们放到" + qm->name() + "里面，开始制药。\n";
        msg = sort_string(msg, 64);
        write(msg);
        message("vision", me->name() + "东摸摸，西弄弄，不知道在干啥。\n",
                environment(me), ({ me }));
	me->start_busy(bind((:call_other, __FILE__, "making" :), me),
                       bind((:call_other, __FILE__, "halt_make" :), me));
        me->set_short_desc("正在专心致志的炼制药物。");
        me->set_temp("pending/making", 0);
        me->set_temp("making/medicine", med);
        me->set_temp("making/time", (int)req["time"]);
        me->set_temp("making/require", req);
        me->set_temp("making/container", qm);
        return 1;
}

int stop_making(object me)
{
        me->delete_temp("making");
        me->delete_temp("pending/making");
        me->set_short_desc(0);
        return 0;
}

int making(object me)
{
        int step;
        mapping req;
        string msg_me, msg_out;
        string med;
        object ob;
        object qm;

        step = me->query_temp("pending/making");
        req = me->query_temp("making/require");
        med = me->query_temp("making/medicine");
        qm = me->query_temp("making/container");
        if (qm != me->query_temp("handing"))
        {
                write("嗯？研钵呢...？我的研钵！\n");
                return stop_making(me);
        }

        switch (step)
        {
        default:
                step = 0;
                msg_me = "你拿起棒杵，慢慢的捣着" + qm->name() + "里面的药材。\n";
                msg_out = "$N拿起棒杵叮咣叮咣的捣得很起劲。\n";
                break;
        case 1:
                msg_me = "扑哧扑哧，药材眼见变成了一块块小碎块。\n";
                msg_out = "$N没完没了的捣鼓。\n";
                break;
        case 2:
                msg_me = "你轻轻的研磨着药材，让它越来越细。\n";
                msg_out = "$N紧张的磨着东西。\n";
                break;
        case 3:
                msg_me = "你接着把那些残留的大块儿一点的药材捣碎。\n";
                msg_out = "$N突然又叮咣叮咣的捣个不停。\n";
                break;
        case 4:
                msg_me = "你细细的将所有的药材磨成了粉末。\n";
                msg_out = "$N拿着棒杵磨来磨去。\n";
                break;
        case 5:
                msg_me = "你轻轻的合上" + qm->name() +
                         "，默默的运用内力，烘培里面的药材。\n";
                msg_out = "$N合上" + qm->name() + "，双手抱着，不知道在干什么。\n";
                break;
        case 6:
                if (me->query("jing") < req["jing"])
                {
                        write("你觉得精神不济，看来难以继续调剂「" +
                              med->name() + "」。\n");
                        return stop_making(me);
                }
                        
        
                if (me->query("neili") < req["neili"])
                {
                        write("你觉得内力不济，看来难以继续调剂「" +
                              med->name() + "」。\n");
                        return stop_making(me);
                }
        
                if (me->query("jingli") < req["jingli"])
                {
                        write("你觉得精力不济，看来难以继续调剂「" +
                              med->name() + "」。\n");
                        return stop_making(me);
                }
        
                me->receive_damage("jing", req["jing"]);
                me->add("neili", -req["neili"]);
                me->add("jingli", -req["jingli"]);

                if (me->add_temp("making/time", -1) > 0)
                {
                        // when time > 0, next busy stage will
                        // still at 6, becuase the step will be
                        // increase by 1 later, so I decrase it
                        // first
                        step--;
                }

                msg_me = random(2) ? "你觉得" + qm->name() + "慢慢的热了起来，感"
                                     "觉到里面的药材似乎已经融化了。\n"
                                   : "你不断的将内力传入" + qm->name() + "，发热"
                                     "使里面的药材融化合一。\n";
                msg_out = random(2) ? "$N像老和尚一样闭目冥神坐在那里。\n"
                                    : "$N手里握着" + qm->name() + "没完没了的转来转去。\n";

                break;
        case 7:
                msg_me = "你运用内力，隔着" + qm->name() + "使里面的药材彻底的融合。\n";
                msg_out = "$N眉毛动了动，接着又像老和尚一样闭目冥神坐在那里。\n";
                break;
        case 8:
                msg_me = "你长吁了一口气，慢慢的把手拿开，打开了" + qm->name() + "。\n";
                msg_out = "$N长吁了一口气，慢慢的把手拿开，打开了" + qm->name() + "。\n";
                break;
         case 9:
                if (random(me->query_skill("medical", 1) +
                           qm->query("item_prop/medical")) >= req["min_level"])
                {
                        ob = new(med);
                        ob->move(qm, 1);
                        msg_me = HIM "你把「" + ob->name() + HIM "」成功的制好了！\n" NOR;
                        msg_out = HIM "$N" HIM "嘴角露出一丝微笑。\n" NOR;
                } else if(!me->query("special_skill/lucky") || random(2) == 0)
                {
                        msg_me = HIG "真令人沮丧！居然失败了，真是可惜了。\n" NOR;
                        msg_out = HIG "$N" HIG "一脸沮丧，不"
                                  "知道发生了什么倒霉事。\n" NOR;
                }else
		  {
                        ob = new(med);
                        ob->move(qm, 1);
                        msg_me = HIM "你感觉似乎有什么地方没有做对，然而你的运气实在太好了！\n你把「" + ob->name() + HIM "」成功的制好了！\n" NOR;
                        msg_out = HIM "$N" HIM "嘴角露出一丝微笑。\n" NOR;
		  }
                break;
        }

        msg_out = replace_string(msg_out, "$N", me->name());
        message("vision", msg_me, me);
        message("vision", msg_out, environment(me), ({ me }));
        step++;
        if (step >= 10)
                // end of making
                return stop_making(me);

        me->set_temp("pending/making", step);
        return 1;
}

int halt_make(object me)
{
        message_vision("$N把手中的研钵一翻个，东西"
                       "全都倒了出来。\n", me);
        stop_making(me);
        return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : make [<药品>] [?]

这个指令可以让你炼制某样药品，如果没有指明药品则会列出当前
你会炼制的药品。如果在指明的药品后面添加一个"?" 则会列出炼
制这种药品需要的材料。

HELP );
    return 1;
}
