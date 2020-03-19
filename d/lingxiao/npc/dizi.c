#include <ansi.h>
inherit NPC;

void create()
{
        set_name("凌霄弟子", ({"lingxiao dizi", "dizi", "lingxiao"}));
        set("gender", "男性");
        set("age", 20);
        set("long", "这是一个凌霄城的普通弟子。\n");
        set("attitude", "peaceful");

        set("str", 30);
        set("con", 30);
        set("int", 30);
        set("dex", 30);
        set("neili", 500);
        set("max_neili", 500);
        set("max_jing", 400);
        set("jing", 400);
        set("max_qi", 800);
        set("qi", 800);
        set("jiali", 20);

        set("combat_exp", 20000);
        set("shen_type", 0);
        set("score", 50000);
        set("chat_chance", 3);
        set("chat_msg", ({
        	CYN "一位凌霄弟子小声说道：听说老爷子发疯了，还把封师叔的膀子卸了下来，不知道是真是假。\n" NOR,
                CYN "一位凌霄弟子冷笑道：打起来了好啊，这下子半年一次的论剑也不用开了，免得挨骂。\n" NOR,
       		CYN "一位凌霄城弟子哼了一声，道：师父一向说我们凌霄城的剑法天下无双，改天我要让那些江湖中人见识一下。\n" NOR,
        	CYN "一位凌霄城弟子不屑道：老爷子的病是气出来的，你们不知道吧。\n" NOR,
        	CYN "一位凌霄城弟子哼了一声，道：马上赏善罚恶使者要来了，我们还是先跑路吧。\n" NOR,
        	CYN "一位凌霄城弟子摇摇头，道：就算赏善罚恶使者来了，只要有人接令牌，我们这些小人物也没事。\n" NOR,
       		CYN "一位凌霄城弟子打了个哈欠，道：昨天轮到老子守城，差点被冷死。\n" NOR,
       		CYN "一位凌霄城弟子搓了搓手，道：昨天我从师父的柜子里偷了瓶参阳玉酒，嘿嘿……真他妈的不错。\n" NOR,
       		CYN "一位凌霄城弟子看看四周，小声说道：上次谢烟客来的时候，带的那个狗杂种，听说是长乐帮的帮主。\n" NOR,
       		CYN "一位凌霄城弟子摆了个架势，大声说：武当少林算什么！老爷子说了，武林中就我们凌霄城最厉害！\n" NOR,
       		CYN "一位凌霄城弟子掏出一瓶酒，喝了两口，红着眼睛说：老爷子是被成师叔祖他们暗算了！我等会就去把他救出来！\n" NOR,
       		CYN "一位凌霄城弟子低声对另一位弟子说，要想进地牢，就必须先拿到寒玉牌啊。\n" NOR,
       		CYN "一位凌霄城弟子愤愤说道：那个狗杂种，上次竟想对阿绣非礼，要是让我遇见，哼哼哼！\n" NOR,
        }) );
        set_skill("unarmed", 100);
        set_skill("sword", 100);
        set_skill("force", 100);
        set_skill("parry", 100);
        set_skill("dodge", 100);
        set_skill("literate", 40);

        setup();
        carry_object("/clone/weapon/changjian")->wield();        
        carry_object("/clone/cloth/cloth")->wear();
}
