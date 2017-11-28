#include <ansi.h>
#include "quanzhen.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

void check_body();
mixed ask_skill1();

void create()
{
        set_name("丘处机", ({ "qiu chuji", "qiu", "chuji" }));
        set("long", @LONG
他就是江湖上人称长春子的丘处机丘真人，他
长得方面大耳，满面红光，剑目圆睁，双眉如
刀，相貌威严，平生疾恶如仇。
LONG);
        set("nickname", HIM "长春子" NOR);
        set("title", "全真七子");
        set("gender", "男性");
        set("age", 40);
        set("class", "taoist");
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 30);
        set("int", 30);
        set("con", 28);
        set("dex", 30);
        set("max_qi", 5000);
        set("max_jing", 4000);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 200);

        set("combat_exp", 2600000);

        set_skill("force", 240);
        set_skill("quanzhen-xinfa", 240);
        set_skill("xuanmen-neigong", 240);
        set_skill("sword", 260);
        set_skill("qixing-jian", 240);
        set_skill("tonggui-jian", 260);
        set_skill("quanzhen-jian", 260);
        set_skill("dodge", 240);
        set_skill("tianshan-feidu", 220);
        set_skill("jinyan-gong", 240);
        set_skill("parry", 240);
        set_skill("strike", 220);
        set_skill("chongyang-shenzhang", 220);
        set_skill("haotian-zhang", 220);
        set_skill("hand", 220);
        set_skill("qixing-shou", 220);
        set_skill("finger", 220);
        set_skill("zhongnan-zhi", 220);
        set_skill("literate", 240);
        set_skill("taoism", 200);
        set_skill("martial-cognize", 240);

        map_skill("force", "xuanmen-neigong");
        map_skill("sword", "quanzhen-jian");
        map_skill("dodge", "jinyan-gong");
        map_skill("parry", "quanzhen-jian");
        map_skill("finger", "zhongnan-zhi");
        map_skill("hand", "qixing-shou");
        map_skill("strike", "haotian-zhang");

        prepare_skill("hand", "qixing-shou");
        prepare_skill("strike", "haotian-zhang");

        create_family("全真教", 2, "弟子");

        set("coagents", ({
                ([ "startroom" : "/d/quanzhen/shiweishi",
                   "id"        : "ma yu" ]),
                ([ "startroom" : "/d/quanzhen/wanwutang",
                   "id"        : "wang chuyi" ]),
        }));

        set("inquiry", ([
                "玉石俱焚" : (: ask_skill1 :),
        ]) );

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: check_body :),
                (: perform_action, "sword.ding" :),
                (: perform_action, "sword.chan" :),
                (: perform_action, "hand.po" :),
                (: perform_action, "strike.ju" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/quanzhen/npc/obj/grayrobe")->wear();
}

void init()
{       
        object ob;

        ::init();

        if (interactive(ob = this_player()) && ! is_fighting())
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        mapping fam;
        //int i ;
        object me = this_object();

        if (! ob || environment(ob) != environment() || ! living(me))
                return;

        if (interactive(ob) && base_name(environment()) == query("startroom"))
        {
                if (! (fam = ob->query("family")) || fam["family_name"] != "全真教")
                {
                        if (ob->is_not_bad())
                        {
                                command("hmm");
                                command("say 这里是本教重地，你走动小心些。");
                        } else
                        {
                                command("say 你这魔头，竟敢闯入我全真重地，接招！");
                                kill_ob(ob);
                        }
                }
        }
}

void check_body()
{
        object weapon, guard;
        object me = this_object();
        object where = environment(me);

        if (! objectp(weapon = me->query_temp("weapon"))
           || me->query("eff_qi") > me->query("max_qi") / 2
           || objectp(guard = present("ma yu", where))
           || objectp(guard = present("wang chuyi", where)))
                return;

        message_vision(HIR "\n$N" HIR "一振手中" + weapon->name() +
                       HIR "，喝道：天杀的贼子！今天你我就拼个鱼死"
                       "网破！\n\n" NOR, me);

	me->set("max_neili", 6500);  // 提升同归剑法绝招的命中率
	me->set("neili", 6500);

        command("jifa sword tonggui-jian");
        set("chat_msg_combat", ({
                (: perform_action, "sword.fen" :),
                (: exert_function, "recover" :),
        }));
        set("chat_chance", 120);
        set("chat_msg", ({
                (: command("jifa sword quanzhen-jian") :),
        }));
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query_skill("xuanmen-neigong", 1) < 100
           && (int)ob->query_skill("quanzhen-xinfa", 1) < 100)
        {
                command("hmm");
                command("say 你连本门最基本的内功都未练足，叫我如何收你？");
                return;
        }

        if ((int)ob->query_skill("sword", 1) < 100)
        {
                command("sneer");
                command("say 你的剑法差成这样，如何能够杀敌？");
                return;
        }

        if ((int)ob->query("shen") < 25000)
        {
                command("say 你目前表现太差！多做点行侠仗义的事再来找我！\n");
                return;
        }

        command("nod");
        command("say 我收下你便是，但你可别坏了我们全真七子的名头。");
        command("say 假如某日我知道你在外面作恶，照样会杀了你。");
        command("recruit " + ob->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/tonggui-jian/fen"))
                return "我不是已经教你了吗，你这人怎么凭的罗嗦！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫道素不相识，不知此话从何说起？";

        if (me->query_skill("tonggui-jian", 1) < 1)
                return "你连同归剑法都没学，何谈绝招可言？";

        if (me->query("gongxian") < 600)
                return "你在我全真教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") < 30000)
                return "你的侠义正事还做得不够，这招我暂时还不能传你。";

        if (me->query_skill("tonggui-jian", 1) < 120)
                return "你的同归剑法不够娴熟，练高点再来吧。";

        if (me->query_skill("force") < 150)
                return "你的内功修为不够，修炼高后再来找我吧。";

        if (me->query("max_neili") < 1500)
                return "你的内力修为不够，修炼高后再来找我吧。";

        message_sort(HIY "\n$n" HIY "$n" HIY "哈哈一笑，赞道：“不错，有志"
                     "气！难得我全真教内有你这般人材，今日为师就传授你这招"
                     "！必要时和敌人同归于尽，宁为玉碎，不为瓦全！”说罢$n"
                     HIY "便从怀中轻轻取出了一本剑谱，指着其中一段对$N" HIY
                     "细说良久，$N" HIY "一边听一边点头。\n\n" NOR, me,
                     this_object()); 

        command("nod");
        command("say 虽说是舍生成仁，但不至万不得已，也莫要轻易使用。");
        tell_object(me, HIC "你学会了「玉石俱焚」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("tonggui-jian"))
                me->improve_skill("tonggui-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/tonggui-jian/fen", 1);
        me->add("gongxian", -600);

        return 1;
}
