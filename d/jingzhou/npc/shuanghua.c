#include <ansi.h>
inherit NPC;
int ask_me();

void create()
{
        set_name("凌霜华", ({ "ling shuanghua", "ling", "shuanghua" }));
        set("long", "她长得清秀脱俗，真是人淡如菊。\n");
        set("gender", "女性");
        set("age", 18);

        set("attitude", "friendly");
        set("inquiry", ([
            "丁典" : (: ask_me :),
            "丁大哥" : (: ask_me :),
       ]) );

        set_skill("unarmed", 40);
        set_skill("dodge", 40);
        set_skill("parry", 40);
        set_temp("apply/attack", 30);
        set_temp("apply/defense", 30);
        set_temp("apply/damage", 5);

        set("combat_exp", 2000);
        set("shen_type", 1);
        setup();
        carry_object(__DIR__"obj/necklace")->wear();
        carry_object(__DIR__"obj/pink_cloth")->wear();
}

void init()
{
        object ob;

        ::init();
        if (interactive(ob = this_player()) && !is_fighting()) {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object me)
{
        command("fu " + me->query("id"));
        command("say 这位"+RANK_D->query_respect(me)+"是来"+
                "看菊花的吧？");
        command("say 不知道爹爹在花园里种了什么，人一进去就会被熏死的，"+
                "你还是请回吧。");
}

        
int accept_kill(object me)
{
        command("say 丁大哥救命啊！" + me->name() + "这个" + RANK_D->query_rude(me) + "要强暴我！\n");
        kill_ob(me);
        return 1;
}

int ask_me()
{
        object who=this_player();
        if (who->query_temp("jinboxunhua")) {
                command("say 我不是告诉你了吗？你记性也太那个了。");
                return 1;
        }
        command("say 啊！你是丁大哥的朋友啊！家父在花园里中了剧毒的金波旬花，"
                + "你进去后屏住呼吸就可以了。");
        who->set_temp("jinboxunhua",1);
        return 1;
}

