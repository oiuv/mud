// liandan_tongzi.c

#include <ansi.h>

inherit NPC;

mixed ask_caiyao();

void create()
{
        set_name("小童", ({"xiao tong", "xiao", "tong"}));
        set("gender", "男性");
        set("age", 12);
        set("long",
                "这是炼丹房中的掌管药材的童子。他年纪不大，但看起来\n"
                "显得少年老成。\n");
        set("attitude", "friendly");
        set("shen_type",1);
        set("str", 21);
        set("int", 22);
        set("con", 23);
        set("dex", 22);
        set("qi", 600);
        set("max_qi", 600);
        set("jing", 400);
        set("max_jing", 400);
        set("neili", 1200);
        set("max_neili", 1200);;

        set("combat_exp", 300000);

        set("inquiry", ([
                "药材" : (: ask_caiyao :),
                "药"   : (: ask_caiyao :),
                "采药" : (: ask_caiyao :),
                "草药" : (: ask_caiyao :),
                "yaocai" : (: ask_caiyao :),
        ]) );
        set("caiyao", 12);

        setup();
}

mixed ask_caiyao()
{  
        object me = this_player();

        switch (me->query_temp("caiyao"))
        {
        case 1:
                return "叫你去采药，还呆在这干嘛！";

        case 2:
                return "药采来了？还不快给我！";
        }

        switch (me->query_temp("liandan"))
        {
        case 1:
                // 已经打听过了练丹的消息了
                break;

        case 2:
                return "药材已经准备好，可以去了。";

        case 3:
                return "你不是在里面炼药吗？怎么出来了。";

        case 4:
                return "还是先去复命吧。";

        default:
                return "你又不炼药，要药材干什么？";
        }

        message_vision(CYN "小童对$N" CYN "说道：好吧，那你"
                       "去城西的林子里挖几样新鲜的草药来。\n" NOR, me);
        me->set_temp("caiyao", 1);
        add("caiyao", -1);
        return 1;
}

int accept_object(object me, object ob)
{
        int exp, pot;

        if (me->query_temp("caiyao") < 1)
        {
                command("say 我什么时候叫你拿这个给我的？");
        } else
	if (me->query_temp("caiyao") == 1)
        {
                command("say 是谁帮你找的东西来敷衍我，别以为我小就好骗。");
        } else
	if (strsrch(ob->query("name"), "不知名草药") < 0) 
        {
                command("say 你欺我小啊？拿这种东西骗我。\n");
        } else
	{
                command("say 好吧，让我来给你加工。");
                command("say 你现在直接去丹房炼丹（liandan）就行了。");
                me->delete_temp("caiyao");
                me->set_temp("liandan", 2);
				//奖励增加5倍（2015年4月25日）
                exp = 2 + random(2);
                pot = 1 + random(2);

                me->add("combat_exp", exp);
                me->improve_potential(pot);

                if (me->query("potential") > me->query_potential_limit()) 
			pot = 1;

                tell_object(me, HIC "你获得了" + chinese_number(exp) +
                                "点经验和" + chinese_number(pot) + "点潜能。\n"
                                NOR );
                destruct(ob);
                return 1;
        }
        return 0;
}

