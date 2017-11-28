// abi.c

inherit NPC;

void create()
{
        set_name("阿碧", ({ "abi", "bi" }));
        set("long",
                "这是个身穿绿衣的女郎，约十六七岁年纪，满脸都是温柔，\n"
                "满身都是秀气。一张可爱的瓜子脸，肤白如新剥鲜藕，说话\n"
                "声音极甜极清，令人一听之下说不出的舒适。嘴角边一粒细\n"
                "细的黑痔，更增俏媚。\n");
        set("gender", "女性");
        set("age", 16);
        set("shen_type", 1);

        set("neili", 200);
        set("max_neili", 200);
        set("max_qi", 160);
        set("max_jing", 160);
        set_skill("force", 40);
        set_skill("unarmed", 40);
        set_skill("dodge", 30);
        set_skill("parry", 30);
        set_skill("sword", 30);
        set_temp("apply/attack", 10);
        set_temp("apply/defense", 10);
        set_temp("apply/damage", 5);

        set("combat_exp", 10000);
        set("inquiry",([
            "曼陀山庄" : "我才不敢去曼陀山庄，王夫人太霸道了!\n",
            "王语嫣"   : "哎，只有她才配得上我们公子，也不知她现在怎么样了!\n",
            "阿朱"     : "那小妮子只大我一岁，整天就喜欢扮别人玩。\n",
        ]) );
        setup();
        carry_object(__DIR__"obj/goldring")->wear();
        carry_object(__DIR__"obj/necklace")->wear();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object(__DIR__"obj/green_cloth")->wear();
        carry_object(__DIR__"obj/flower_shoe")->wear();
}
