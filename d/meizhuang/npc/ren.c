// renwoxing.c

#include <ansi.h>

inherit NPC;
inherit F_MASTER;
int ask_bijian();

void create()
{
        set_name("任我行", ({ "ren woxing", "ren","woxing" }));
        set("title", HIR "日月神教上任教主" NOR);
        set("long", "这便是日月神教上任教主任我行。只见\n"
                    "他一张长长的脸孔，脸色雪白，更无半\n"
                    "分血色。他眉目清秀，身材甚高，一头\n"
                    "黑发，穿的是一袭青衫。\n");
        set("gender", "男性");
        set("class", "scholar");
        set("age", 55);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 40);
        set("int", 40);
        set("con", 40);
        set("dex", 40);
        
        set("max_qi", 8000);
        set("max_jing", 6000);
        set("neili", 10000);
        set("max_neili", 10000);
        set("jiali", 500);
        set("combat_exp", 4000000);
        set("score", 50000);

        set_temp("apply/attack", 1000);

        set_skill("literate", 250);
        set_skill("force", 400);
        set_skill("dodge", 360);
        set_skill("unarmed", 360);
        set_skill("parry", 360);
        set_skill("sword", 360);
        set_skill("changquan", 360);
        set_skill("xixing-dafa", 400);
        set_skill("lingxu-bu", 360);
        set_skill("damo-jian", 360);
        set_skill("taiji-jian", 360);
        set_skill("huifeng-jian", 360);
        set_skill("taishan-sword", 360);
        set_skill("hengshan-jian", 360);
        set_skill("hengshan-sword", 360);
        set_skill("huashan-jian", 360);
        set_skill("songshan-sword", 360);

        map_skill("dodge", "lingxu-bu");
        map_skill("force", "xixing-dafa");
        map_skill("unarmed", "changquan");
        map_skill("sword", "damo-jian");
        map_skill("parry", "taiji-jian");

        set("inquiry", ([
                "比剑" :  (: ask_bijian :),
                "剑法" :  (: ask_bijian :),
                "黑木令" : "要拿黑木令？老夫想先看看你的剑法！\n",
        ]) );
        setup();
        carry_object("/d/wudang/obj/bluecloth")->wear();
        carry_object("/clone/weapon/changjian")->wield();
}

int ask_bijian()
{
        object weapon/*, obj*/;
        object me = this_player(), ob = this_object();

        if (me->query_temp("want_bijian")) 
        {
                command("say 你这人这么那么不爽快？要比就赶紧开始吧！");
                        return 1;
        }

        if (me->query("skybook/xiaoao/bijian")) 
        {
                command("say 我们已经比试过了，没必要再战一场。");
                        return 1;
        }

        if (me->query_temp("bijian_fail")) 
        {
                command("say 你已经输了，再比下去也没什么结果。");
                        return 1;
        }

        if (me->query("combat_exp") < 1500000)
        {
                command("heng");
                command("say 你还不配和我比剑！");
                        return 1;
        }

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
        {
                command("say 你不拿剑我还和你比什么？");
                        return 1;
        }

        message_vision(CYN "$N" CYN "躬身说道：晚辈今日有幸拜见"
                       "任老前辈，还望多加指教。\n$n" CYN "笑道"
                       "：不用客气，你来解我寂寞，可多谢你啦。"
                       "\n" NOR, me, ob );

        message_vision(CYN "$N" CYN "微笑道：不敢，还请老前辈赐"
                       "教！\n$n" CYN "点了点头，说道：我只想"
                       "瞧瞧你的剑法，并非真的过招，再说，我也未"
                       "必能胜得了你。\n" NOR, me, ob);
        tell_object(me, HIR "你愿意和(accept)任我行开始比剑吗？\n" NOR);
        me->set_temp("want_bijian", 1);
        add_action("do_accept", "accept");
        return 1;
}

int do_accept()
{
        int eff;
        object weapon, obj;
        object me = this_player(), ob = this_object();
        eff = me->query("max_qi") / 3;

        if (me->query_temp("want_bijian"))
        {
	        if (! objectp(weapon = me->query_temp("weapon")) ||
  	           (string)weapon->query("skill_type") != "sword")
  	        {
        	        command("say 他奶奶的，你把剑取了这算什么意思？");
                        return 1;
  	        }

                say (CYN "\n任我行哈哈一笑，说道：那我就开始进招了。\n" NOR + HIW
                     "\n只见任我行说罢身形一展，一道剑光由他处凌厉闪出。\n" NOR,
                     me, ob);

                say (HIW "\n任我行大喝一声：看好了，我这第一招乃少林派达摩剑法"
                         "！\n" NOR);
                COMBAT_D->do_attack(ob, me, query_temp("weapon"));
                if ((int)me->query("qi") < eff || ! present(me, environment()))
                {
                        say(CYN "任我行叹了口气，说道：才一招。\n" NOR);
                        me->delete_temp("want_bijian", 1);
                        me->set_temp("bijian_fail", 1);
                        return 1;
                }

                command("enable sword taiji-jian");
                say(HIW "\n任我行大喝一声：第二招！武当派太极剑法！\n" NOR);
                COMBAT_D->do_attack(ob, me, query_temp("weapon"));
                if ((int)me->query("qi") < eff || ! present(me, environment()))
                {
                        say(CYN "任我行叹了口气，说道：才两招。\n" NOR);
                        me->delete_temp("want_bijian", 1);
                        me->set_temp("bijian_fail", 1);
                        return 1;
                }

                command("enable sword huifeng-jian");
                say(HIW "\n任我行大喝一声：第三招！峨嵋派回风拂柳剑法！\n" NOR);
                COMBAT_D->do_attack(ob, me, query_temp("weapon"));
                if ((int)me->query("qi") < eff || ! present(me, environment()))
                {
                        say(CYN "任我行叹了口气，说道：才三招。\n" NOR);
                        me->delete_temp("want_bijian", 1);
                        me->set_temp("bijian_fail", 1);
                        return 1;
                }

                command("enable sword songshan-sword");
                say(HIW "\n任我行大喝一声：第四招！嵩山剑法之天外玉龙！\n" NOR);
                COMBAT_D->do_attack(ob, me, query_temp("weapon"));
                if ((int)me->query("qi") < eff || ! present(me, environment()))
                {
                        say(CYN "任我行叹了口气，说道：才四招。\n" NOR);
                        me->delete_temp("want_bijian", 1);
                        me->set_temp("bijian_fail", 1);
                        return 1;
                }

                command("enable sword taishan-sword");
                say(HIW "\n任我行大喝一声：第五招！泰山派十八盘剑法！\n" NOR);
                COMBAT_D->do_attack(ob, me, query_temp("weapon"));
                if ((int)me->query("qi") < eff || ! present(me, environment()))
                {
                        say(CYN "任我行叹了口气，说道：才五招。\n" NOR);
                        me->delete_temp("want_bijian", 1);
                        me->set_temp("bijian_fail", 1);
                        return 1;
                }

                command("enable sword huashan-jian");
                say(HIW "\n任我行大喝一声：第六招！华山剑宗夺命连环三仙剑！\n" NOR);
                COMBAT_D->do_attack(ob, me, query_temp("weapon"));
                if ((int)me->query("qi") < eff || ! present(me, environment()))
                {
                        say(CYN "任我行叹了口气，说道：才六招。\n" NOR);
                        me->delete_temp("want_bijian", 1);
                        me->set_temp("bijian_fail", 1);
                        return 1;
                }

                command("enable sword hengshan-sword");
                say(HIW "\n任我行大喝一声：第七招！衡山剑法之一剑落九雁！\n" NOR);
                COMBAT_D->do_attack(ob, me, query_temp("weapon"));
                if ((int)me->query("qi") < eff || ! present(me, environment()))
                {
                        say(CYN "任我行叹了口气，说道：才七招。\n" NOR);
                        me->delete_temp("want_bijian", 1);
                        me->set_temp("bijian_fail", 1);
                        return 1;
                }

                command("enable sword hengshan-jian");
                say(HIW "\n任我行大喝一声：小心了，我这最后一招乃恒山派万花剑法！\n" NOR);
                COMBAT_D->do_attack(ob, me, query_temp("weapon"));
                if ((int)me->query("qi") < eff || ! present(me, environment()))
                {
                        say(CYN "任我行叹了口气，说道：还是没过第八招。\n" NOR);
                        me->delete_temp("want_bijian", 1);
                        me->set_temp("bijian_fail", 1);
                        return 1;
                }

                obj = new("/d/heimuya/obj/heimu-ling");
                obj->move(me);
                say(CYN "\n任我行哈哈大笑说道：阁下果然武艺超群，再来接我这路剑法！\n\n" NOR);

                message_vision(HIR "说完任我行一声长啸，木剑倏地劈出。$N" HIR "当即斜剑"
                               "刺出，逼得他收剑回挡。任\n我行连连呼喝，竟似发疯一般。呼"
                               "喝越急，出剑也是越快。$N" HIR "觉得每一声断喝\n都令他双"
                               "耳嗡嗡作响，心烦意乱。突然之间，任我行石破天惊般一声狂啸"
                               "。$N" HIR "\n耳中嗡的一响，耳鼓都似震破，脑中一阵晕眩，登"
                               "时人事不知，昏倒在地……\n" NOR, me, ob );
                me->delete_temp("want_bijian", 1);
                me->set("skybook/xiaoao/bijian", 1);
                me->unconcious();
        }
        return 1;
}