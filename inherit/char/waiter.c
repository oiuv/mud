// 店铺伙计程序
// Create by smallfish.
// Update by jjgod.

inherit NPC;

int is_waiter()
{
	return 1;
}

// 修改属性
int do_modify(string arg)
{
        write(SHOP_D->do_modify(this_object(), this_player(), arg));
        return 1;
}

// 标价货物
int do_stock(string arg)
{
        write(SHOP_D->do_stock(this_object(), this_player(), arg));
        return 1;
}

// 取下货物
int do_unstock(string arg)
{
       write(SHOP_D->do_unstock(this_object(), this_player(), arg));
       return 1;
}

// 查询货物列表
int do_list(string arg)
{
        write(SHOP_D->do_list(this_object(), this_player(), arg));
        return 1;
}

// 购买货物
int do_buy(string arg)
{
        return SHOP_D->do_buy(this_object(), this_player(), arg);
}

// 店主结帐
int do_jiezhang()
{
        write(SHOP_D->do_jiezhang(this_object(), this_player()));
        return 1;
}

// 设置、查询贵宾
int do_invite(string arg)
{
        string msg;

        if (arg)
                msg = SHOP_D->do_invite(this_object(), this_player(), arg);
        else
                msg = SHOP_D->list_invite(this_object(), this_player());

        write(msg);
        return 1;
}

// 设置、查询贵宾
int do_ban(string arg)
{
        string msg;
        if (arg)
                msg = SHOP_D->do_ban(this_object(), this_player(), arg);
        else
                msg = SHOP_D->list_ban(this_object(), this_player());
        write(msg);
        return 1;
}


void init()
{
        if (this_player()->query("id") == environment()->query("owner"))
        {
                add_action("do_stock", "stock");
                add_action("do_unstock", "unstock");
                add_action("do_jiezhang", ({ "reckoning", "jiezhang"}));
                add_action("do_modify", "modify");
                add_action("do_invite", ({ "invite", "vip" }));
                add_action("do_ban", ({ "ban", "unwelcome", }));
        }
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}

void die()
{	
        return;
}

void unconcious()
{
        die();
}
