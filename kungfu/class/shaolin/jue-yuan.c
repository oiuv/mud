#include <ansi.h>
inherit NPC;

void create()
{
	set_name("觉远", ({ "jue yuan", "jue", "yuan" }));
	set("long", "一位衣着朴素、须发花白的老僧。只见他正挑着一\n"
                    "对大铁桶，比之寻常水桶大了两倍有余，那僧人颈\n"
                    "中、手上、脚上，更绕满了粗大的铁链，行走时铁\n"
                    "链拖地，不停发出声响。这对大铁桶本身只怕便有\n"
                    "二百来斤，桶中装满了水，重量更是惊人。\n" );
	set("gender", "男性");
	set("attitude", "friendly");
	set("class", "bonze");

	set("age", 60);
	set("shen_type", 1);
	set("str", 32);
	set("int", 34);
	set("con", 31);
	set("dex", 30);
	set("max_qi", 8000);
	set("max_jing", 6000);
	set("neili", 9000);
	set("max_neili", 9000);
	set("jiali", 300);
	set("combat_exp", 5000000);

	set_skill("force", 380);
	set_skill("jiuyang-shengong", 400);
	set_skill("shaolin-jiuyang", 180);
	set_skill("wudang-jiuyang", 180);
	set_skill("emei-jiuyang", 180);
	set_skill("dodge", 220);
	set_skill("shaolin-shenfa", 220);
	set_skill("unarmed", 380);
	set_skill("parry", 260);
        set_skill("martial-cognize", 300);
	set_skill("buddhism", 200);
	set_skill("literate", 100);

	map_skill("force", "jiuyang-shengong");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("unarmed", "jiuyang-shengong");
	map_skill("parry", "jiuyang-shengong");

	prepare_skill("unarmed", "jiuyang-shengong");

        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/dodge", 150);
        set_temp("apply/damage", 200);
        set_temp("apply/unarmed_damage", 200);

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "unarmed.hun" :),
		(: perform_action, "unarmed.jiu" :),
		(: exert_function, "recover" :),
		(: exert_function, "powerup" :),
		(: exert_function, "shield" :),
	}));

	create_family("少林派", 0, "打杂僧人"); 

	setup();

        carry_object("/d/shaolin/obj/xu-cloth")->wear();
}

void attempt_apprentice(object ob)
{
        message_vision(CYN "$N" CYN "摇了摇头，对$n" CYN "说道：“贫僧乃带"
                       "罪之身，岂能收徒。”\n" NOR, this_object(), ob);
}

void init()
{
        object me;

        me = this_player();

        if (! interactive(me))
                return;

        if (living(this_object()) && present("lengjia jing", me))
        {
                command("yi");
                command("say 这位施主，本派遗失的《楞伽经》怎会在你身上！");
                command("say 请这位施主行个方便，将经书还给贫僧。");
                return;
        }
}

int accept_object(object who, object ob)
{
        if (ob->query("id") == "lengjia jing")
        {
                destruct(ob);
                if (who->query("can_learn/jiuyang-shengong/kunlun"))
                {
                        if (who->query("can_learn/jiuyang-shengong/shaolin"))
                        {
                                command("say 多谢，多谢。");
                                return 1;
                        } else
                        {
                                message_vision(CYN "$N" CYN "满脸欢喜的对$n" CYN "道"
                                               "：施主宅心仁厚，日后必有大成，贫僧多"
                                               "谢了。\n" NOR, this_object(), who);
                                command("sigh");
                                command("say 无数好事之人贪图于此，乃是为了这本经书里"
                                        "所记载的一门武功。");
                                command("say 施主为人忠厚正直，倘若不嫌弃，贫僧倒是可"
                                        "以将这门武功的一部分传授于你。");

                                who->set("can_learn/jiuyang-shengong/shaolin", 1);
                                tell_object(who, HIC "觉远同意传授你「少林九阳功」。\n" NOR);

                                if (who->can_improve_skill("martial-cognize"))
                                        who->improve_skill("martial-cognize", 1500000);
                                return 1;
                        }
                }
                message_vision(CYN "$N" CYN "满脸欢喜的对$n" CYN "道：施主宅心仁厚，"
                               "日后必有大成，贫僧多谢了。\n" NOR, this_object(), who);
                return 1;
        }
        return 0;
}

int recognize_apprentice(object who, string skill)
{
        if (! who->query("can_learn/jiuyang-shengong/shaolin"))
        {
                command("say 施主言重了，贫僧本事低微，何谈“指点”二字。");
                return -1;
        }

        if (skill != "shaolin-jiuyang")
        {
                command("say 正所谓“知足而乐，能忍则安”，其它武功请恕贫僧不能教授。");
                return -1;
        }
        return 1;
}
