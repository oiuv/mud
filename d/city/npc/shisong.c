#include <ansi.h>
inherit NPC;

#define HEILONG    "/clone/lonely/heilongbian"
#define LING       "/clone/lonely/item/tongjiling"

void create()
{
        object ob;
        set_name("史松", ({ "shi song", "shi", "song" }));
        set("gender", "男性");
        set("long", "这是一个精壮汉子，军官模样，腰间围一条长鞭。\n");
        set("nickname", WHT "黑龙鞭" NOR);
        set("title", "巡捕首领");
        set("age", 35);
        set("str", 25);
        set("dex", 20);
        set("max_qi", 500);
        set("max_jing", 300);
        set("neili", 800);
        set("max_neili", 800);
        set("jiali", 50);
        set("combat_exp", 300000);
        set("shen_type", -1);
        set("attitude", "peaceful");

        set_skill("force", 120);
        set_skill("bagua-xinfa", 120);
        set_skill("whip", 120);
        set_skill("yunlong-bian", 120);
        set_skill("cuff", 100);
        set_skill("bagua-quan", 100);
        set_skill("dodge", 100);
        set_skill("feiyan-zoubi", 100);
        set_skill("parry", 100);
        set_skill("literate", 80);
        set_skill("martial-cognize", 80);

        map_skill("force", "bagua-xinfa");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("cuff", "bagua-quan");
        map_skill("whip", "yunlong-bian");
        map_skill("parry", "yunlong-bian");

        prepare_skill("cuff", "bagua-quan");

        set_temp("apply/attack", 30);
        set_temp("apply/defense", 30);
        set_temp("apply/armor", 100);
        set_temp("apply/damage", 50);
        set_temp("apply/unarmed_damage", 50);

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "cuff.gua" :),
                (: perform_action, "whip.chan" :),
                (: exert_function, "recover" :),
        }));

        set("inquiry", ([
                "茅十八" : "谁帮我干掉这恶贼，我一定保他前程似锦。",
                "缠字诀" : "我总得留两手吧？",
        ]));

        set("chat_chance", 1);
        set("chat_msg", ({
                CYN "史松说道：在下黑龙鞭史松，奉鳌少保将令，擒拿天地会反贼。\n" NOR,
                CYN "史松说道：鳌少保天生神勇，曾在北京街上一拳打死一头疯牛。\n" NOR,
        }));

        setup();

        if (clonep())
        {
                ob = find_object(HEILONG);
                if (! ob) ob = load_object(HEILONG);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new("/clone/weapon/changbian");
                        ob->move(this_object());
                        ob->wield();
                }
        }

        carry_object("/d/beijing/npc/obj/guanfu3")->wear();
        add_money("silver", 20);
}

void init()
{
        object me, ob;
        ::init();

        ob = this_player();
        me = this_object();

        if (ob->query("id") == "mao shiba")
        {
                command("say 茅十八你这个反贼，今天终于逮到你了！");
                me->set_leader(ob);
                remove_call_out("kill_ob");
                call_out("kill_ob", 1, ob); 
        }

        if (interactive(ob)
	   && ! environment(ob)->query("no_fight")
           && (ob->query("combat_exp") > 150000)
           && (ob->query("family/family_name") == "天地会"))
        {
                command("say 你这个天地会反贼，纳命来吧！");
                me->set_leader(ob);
                remove_call_out("kill_ob");
                call_out("kill_ob", 1, ob); 
        }
}

int accept_object(object me, object ob)
{
        int exp, pot, sc;

        exp = 1000 + random(300);
        pot = 500 + random(250);
        sc = 5 + random(25);	//奖励增加

        if (base_name(ob) != LING)
        {
                command("say 你给我这种东西干什么？");
                return 0;
        }

        if (me->query("combat_exp") > 10000)
        {
                if (! (int)me->query("skybook/luding/shi"))
                {
                        me->add("combat_exp", exp);
                        me->add("potential", pot);
                        me->add("score", sc);
                        tell_object(me, HIW "\n\n你成功的帮助史松弄到了通缉令！\n" NOR +
                                        HIC "通过这次的历练，你获得了" + chinese_number(exp) +
                                        "点经验、" + chinese_number(pot) + "点潜能以及" +
                                        chinese_number(sc) + "点江湖阅历。\n\n" NOR);
                        me->set("skybook/luding/shi", 1);
                        me->set("can_learn/yunlong-bian/shi", 1);
                }
                command("haha");
                command("say 你把那姓茅的大盗干掉了？这可真是谢谢你了。");
                command("say 我这有一套云龙鞭法，如果你愿意，我倒是可以传你两手。\n");
        } else
        {
                command("nod " + me->query("id"));
                command("say 不错，不错。可惜你江湖经验太浅，要不还可教你点东西。");
        }
        destruct(ob);
        return 1;
}

int recognize_apprentice(object me, string skill)
{
        if (! me->query("can_learn/yunlong-bian/shi"))
        {
                command("say 奶奶的，你找死么？");
                return -1;
        }

        if (skill != "yunlong-bian")
        {
                command("say 我拿手的就只有这套鞭法，你不学就算了。");
                return -1;
        }
        return 1;
}

int accept_fight(object me)
{
        command("say 没兴趣。");
        return 0;
}

int accept_hit(object me)
{
        command("say 他奶奶的，连我你都敢惹？");
        kill_ob(me);
        return 1;
}
