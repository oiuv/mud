// coagent.c

#include <ansi.h>
#include <dbase.h>

STATIC_VAR_TAG int helping = 0;

int is_coagent() { return 1; }

int is_helping() { return helping; }

int start_help(object env, object helper, object ob)
{
        object me;

	command("yun powerup");
        me = this_object();
        if (! living(me)) return 0;

        if (env == environment())
        {
                if (this_object()->is_killing(ob->query("id")))
                        return 1;

                message_vision(HIW + "$N冷笑不止：“好个" +
                               RANK_D->query_rude(ob) + "！你也来添乱？”\n",
                               me);
        } else
        {
                if (helping || me->is_fighting())
                        return 0;

                message_vision(HIC + me->name() + "微微一愣，似乎听到了什么，"
                               "双足一点，扑了出去。\n" NOR, me);
    
                me->move(env);
                if (objectp(helper))
                {
                        message_vision(random(2) ? HIW + "$N高声应道：“$n！不必惊慌，我$N来了！”\n" NOR :
                                                   HIW + "$N一声长吟：“且慢，还有我$N呢，接招！”\n",
                                       me, helper);
                }
        }

        me->kill_ob(ob);
        helping = 1;
        return 1;
}

void finish_help()
{
        string startroom;
        object me;

        me = this_object();
        if (! helping)
                return;

        startroom = me->query("startroom");
        if (! stringp(startroom) || startroom == "")
                return;

        if (base_name(environment()) != startroom)
        {
                message_vision("$N看了看四周，匆匆地离开了。\n", me);
                me->move(startroom);
                message_vision("$N匆匆地赶了过来，拍了拍尘土，仿佛什么"
                               "都没有发生似的。\n", me);
        }

        helping = 0;
}
