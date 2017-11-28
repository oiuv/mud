// guarder.c
// Ivy 针对FamilyWar调整

#include <ansi.h>

int is_guarder() { return 1; }

int permit_pass(object ob, string dir)
{
        object *inv;
        string fam_name;
        string my_fam;
      //string war_fam;
        string born_fam;
        string msg;
        int i;

        if (! living(this_object()))
                return 1;

        notify_fail("看来" + this_object()->name() + "不打算让你过去。\n");
        fam_name = ob->query("family/family_name");
        my_fam   = (string) this_object()->query("family/family_name");
        born_fam = (string) ob->query("born_family");
/*
        war_fam = (string) ob->query("fam_info/family");
        if (war_fam == my_fam)
        {
				message_vision(CYN "$N" CYN "看到$n" CYN "攻打到门派核心地带来了，顿时"
							   "大惊，仓皇失措，不知如何应对。\n" NOR,
							   this_object(), ob);
                return 1;
        }
*/
        if (born_fam == my_fam && fam_name && fam_name != my_fam)
        {
	        if (stringp(msg = this_object()->query("guarder/refuse_home")))
	                message_vision(msg + "\n", this_object(), ob);
                else
                        message_vision(CYN "$N" CYN "冷冷地看了看$n" CYN "，道：你"
                                       "既然已经入了" + fam_name + CYN "，还来我们"
                                       + my_fam + CYN "干什么？\n" NOR,
                                       this_object(), ob);
                return 0;
        }

        if (my_fam != fam_name && my_fam != born_fam)
        {
	        if (stringp(msg = this_object()->query("guarder/refuse_other")))
	                message_vision(msg + "\n", this_object(), ob);
	        else
                        message_vision(CYN "$N" CYN "伸手拦住$n" CYN "道：对不起，"
                                       "不是我们" + my_fam + CYN "的人不得入内！\n"
                                       NOR, this_object(), ob);
                return 0;
        }

        inv = deep_inventory(ob);
        for (i = 0; i < sizeof(inv); i++)
        {
                if (! userp(inv[i])) continue;
                if ((string) inv[i]->query("family/family_name") != fam_name)
                {
	                if (stringp(msg = this_object()->query("guarder/refuse_carry")))
	                        message_vision(msg + "\n", this_object(), ob);
	                else
                                message_vision(CYN "$N" CYN "对$n" CYN "喝道：你背"
                                               "的是谁？还不快快放下！\n" NOR,
                                               this_object(), ob);
                        return 0;
                }
        }

        return 1;
}

void kill_enemy(object ob)
{
        mixed result;

        mapping *co;
        string startroom;
        object room;
        object coagent;
        object me;
        int i;
        int flag;

        me = this_object();

        if (! pointerp(co = me->query("coagents")))
                return;

        if (sizeof(co) < 1)
                return;

        if (base_name(environment(me)) != (string)me->query("startroom"))
                return;
		//门派浩劫
/*
        if ((string) ob->query("fam_info/family") == (string) me->query("family/family_name"))
        {
				message_vision(random(2) ? HIY "\n$N" HIW "大声喊道：大家快来帮忙啊！\n\n" NOR :
										   HIR "\n$N" HIW "喝道：不好！敌人打上门来了！\n\n" NOR, me);
                return;
        }
*/
        message_vision(random(2) ? HIW "\n$N" HIW "大声喊道：大家快来帮忙啊！\n\n" NOR :
                                   HIW "\n$N" HIW "喝道：不好！有人挑上门来了！\n\n" NOR, me);
        flag = 0;
        for (i = 0; i < sizeof(co); i++)
        {
                if (! mapp(co[i])) continue;

                startroom = co[i]["startroom"];
                if (! objectp(room = find_object(startroom)))
                {
                        result = catch(room = load_object(startroom));
                        if (! objectp(room))
                        {
                                if (wizardp(this_object()))
                                        write(sprintf("读取物件错误：%s\n捕捉讯息：%s\n\n",
                                              startroom, result));
                                continue;
                        }
                }

                if (! objectp(coagent = present(co[i]["id"], room)) &&
                    ! objectp(coagent = present(co[i]["id"], environment())) ||
                    ! coagent->is_coagent() ||
                    coagent == this_object())
                        continue;

                flag += (int)coagent->start_help(environment(), me, ob);
        }

        if (! flag)
                message_vision(HIW "结果没有一个人出来。\n" NOR, me);
}

int check_enemy(object ob, string type)
{
        mapping myfam;
        object me;

        me = this_object();
        myfam = ob->query("family");
        if (! mapp(myfam) || ! myfam ||
                myfam["family_name"] != me->query("family/family_name"))
        {
                if (type == "fight")
                {
                        message_vision(CYN "$N" CYN "对$n" CYN "摇摇头道：我现在"
                                       "没空。\n\n" NOR, me, ob);
                        return 0;
                } else
                {
                        message_vision(HIR "$N" HIR "大喝道，好你个" + RANK_D->query_rude(ob) +
                                       HIR "，活得不耐烦了！来这里撒野？\n" NOR, me, ob);
                        me->kill_ob(ob);
                }
        } else
        switch (type)
        {
        case "hit":
        case "kill":
                message_vision(HIR "$N" HIR "两眼一瞪，喝道：" + ob->query("name") +
                               HIR "，你今日是要造反吗？\n" NOR, me, ob);
                me->kill_ob(ob);
                break;

        case "fight":
		if (ob->is_apprentice_of(me))
			message_vision(CYN "$N" CYN "一瞪$n" CYN "，怒道：你给"
                                       "我好好练功去！\n" NOR, me, ob);
		else
                	message_vision(CYN "$N" CYN "对$n" CYN "摇摇头道：找你"
                                       "的师傅比划去。\n\n" NOR, me, ob);
                return 0;
        }

        return 1;
}
