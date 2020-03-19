#include <ansi.h>

inherit NPC;

void create()
{
        set_name("时万年", ({"shi wannian", "shi", "wannian"}));
        set("gender", "男性");
        set("long", "他是凌霄城第六代弟子时万年，乃是继白万剑、封\n"
                    "万里后武功最高、剑法最精的弟子。此时他在此守\n"
                    "卫监狱。\n");
        set("age", 24);
        set("attitude", "peaceful");

        set("str", 25);
        set("con", 30);
        set("int", 24);
        set("dex", 30);

        set("max_qi", 1500);
        set("max_jing", 1200);
        set("neili", 1800);
        set("max_neili", 1800);
        set("jiali", 120);
        set("combat_exp", 800000);

        set("chat_chance", 8);
        set("chat_msg", ({
        	CYN "时万年恨恨说道：老疯子不知道又怎么了，把自己关在里面弄死不肯出来。\n" NOR,
       		CYN "时万年把剑一弹，傲然道：有我守在这，谁都别想把老疯子放出来。\n" NOR,
        }) );

        set_skill("force", 160);
        set_skill("xueshan-neigong", 160);
        set_skill("dodge", 160);
        set_skill("taxue-wuhen", 160);
        set_skill("cuff", 160);
        set_skill("lingxiao-quan", 160);
        set_skill("strike", 160);
        set_skill("piaoxu-zhang", 160);
        set_skill("sword", 180);
        set_skill("hanmei-jian", 180);
        set_skill("yunhe-jian", 180);
        set_skill("parry", 160);
        set_skill("literate", 120);
        set_skill("martial-cognize", 80);

        map_skill("force", "xueshan-neigong");
        map_skill("dodge", "taxue-wuhen");
        map_skill("cuff", "lingxiao-quan");
        map_skill("strike", "piaoxu-zhang");
        map_skill("sword", "yunhe-jian");
        map_skill("parry", "hanmei-jian");

        prepare_skill("strike", "piaoxu-zhang");
        prepare_skill("cuff", "lingxiao-quan");

        create_family("凌霄城", 6, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.chong" :),
                (: perform_action, "cuff.jue" :),
                (: perform_action, "strike.piao" :),
                (: exert_function, "recover" :),
        }));

        setup();
        carry_object("/clone/weapon/changjian")->wear();
        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        command("say 我不收徒，你去找我其它师兄好了。");
}

void init()
{ 
        object ob;
        ::init();

        ob = this_player();

      	if (ob->query("family/family_name") != "凌霄城")
        {
                command("heng");
                command("say 你居然敢闯入本派禁地，受死吧！\n");
                remove_call_out("kill_ob");
                call_out("kill_ob", 1, ob); 
        } else
        if (ob->query("family/master_name") == "白自在")
        {
                command("say 师兄回来了，快去见师祖吧，不过小心点……没准他又犯病了。");
        } else
        if (ob->query("family/master_name") == "白万剑")
        {
                command("say 你是白师哥的弟子吧，老爷子就在里面，他的病越来越不得了啦。");
        }
}
