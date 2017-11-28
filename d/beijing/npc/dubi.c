#include <ansi.h>

inherit NPC;
inherit F_UNIQUE;
inherit F_MASTER;
int do_skills(string arg);

void create()
{
        set_name("独臂神尼", ({ "dubi shenni", "dubi" }));
        set("gender", "女性");
        set("age", 44);
        set("str", 25);
        set("dex", 20);
        set("long", "这是一位白衣女尼，手握拂尘，目视前方。\n"+
                "一只长袖空空如也，显是断了一臂，尽管如此，\n"+
                "仍然掩不住她迷人的风采。\n");
        set("combat_exp", 200000);
        set("shen_type", 1);
        set("attitude", "peaceful");

        set_skill("whip", 150);
        set_skill("force", 90);
        set_skill("unarmed", 90);
        set_skill("dodge", 150);
        set_skill("parry", 90);
        set_skill("qiufeng-chenfa", 150);
        set_skill("shenxing-baibian", 150);
        map_skill("whip", "qiufeng-chenfa");
        map_skill("parry", "qiufeng-chenfa");
        map_skill("dodge", "shenxing-baibian");

        set_temp("apply/attack", 100);
        set_temp("apply/defense", 100);
        set_temp("apply/armor", 40);
        set_temp("apply/damage", 100);
        set("neili", 1500); 
        set("max_neili", 1500);
        set("jiali", 100);
        set("inquiry", ([
                "阿珂" : "神尼叹了一口气，说道：她是我的得意弟子，\n"
                         "人长得挺美，唉，只可惜被韦小宝骗去了。\n",
        ]) );
        setup();
        carry_object("/d/beijing/npc/obj/fuchen")->wield();
        carry_object("/d/beijing/npc/obj/cloth4")->wear();
        add_money("silver", 2);
}

void init()
{
        ::init();
        if (this_player()->query("id") == "la ma")
        {
                delete_temp("saved_by_others");
        } else
        if (interactive(this_player()))
        {
                remove_call_out("greeting");
                call_out("greeting", 1, this_player());
        }
}

int recognize_apprentice(object ob)
{
        if (! ob->query("can_learn/dubi/shenxing-baibian"))
        {
                message_vision("$N摇了摇头。\n",this_object());
                command("say 你我素不相识，为什么我一定要教你呢？"); 
                return -1;
        }
        return 1;       
}

void greeting(object ob)
{
        object man;
        
        if (! ob || environment(ob) != environment()) return;
            
        man = this_object();
        if (! present("la ma"))
        {
                message_vision(HIC "$N踏进屋来，只见地上尸体横陈，一个女"
                               "尼喘息不止。\n" NOR, ob);               
                if (! query_temp("saved_by_others"))
                {
                        set_temp("saved_by_others", 1);
                        ob->set("can_learn/dubi/shenxing-baibian", 1);
                        message_vision("\n白衣女尼对$N说道：“多谢这位" +
                                       RANK_D->query_respect(ob)+
                                       "拔刀相助，贫尼感激不尽，无以为报。\n"
                                       "这里有一套神行百变身法，你若愿学，贫"
                                       "尼定倾囊以授。”\n", ob);
                        if (ob->query("weiwang") < 60)
                        {
                                ob->add("weiwang", 10);
                                message_vision(HIC "$N的江湖威望提高了！\n" NOR,ob);
                                return ;
                        }
                        return;
                }
                message_vision(HIC "白衣女尼对$N微微一笑。\n" NOR,ob);
        }
}

