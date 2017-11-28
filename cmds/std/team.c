// team.c

#include <ansi.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object *t;
        string team_cmd;

	if (! arg)
        {
		if (! pointerp(t = me->query_team()))
			return notify_fail("你现在并没有参加任何队伍。\n");
		write(sort_msg("你现在队伍中的成员有：\n  " +
                      implode(t->short(1), "\n  ") + "。\n"));
		return 1;
	}

        if (sscanf(arg, "%s %s", team_cmd, arg) != 2)
        {
                team_cmd = arg;
                arg = 0;
        }

        team_cmd = __DIR__"team/" + team_cmd + ".c";
        if (file_size(team_cmd) < 0)
                return notify_fail("你要发什么队伍命令？\n");

        return team_cmd->main(me, arg);
}

int help(object me)
{
	write( @HELP
队伍指令使用方法:

team with <某人> - 跟某人组成队伍. 必须要双方都同意加入才会生效。
team dismiss     - 离开队伍. 若下此指令的是领队, 则整个队伍会解散。
team talk <讯息> - 跟队伍里其他的人谈话, 可以用 tt <讯息> 替代。
team form <阵法> - 如果队伍的领队学过阵法的话，可以将队伍中的成员组织成
                   某种阵形，组成阵形的状态只要领袖一移动就会解除。

team kill <某人> - 只有队长才能够下这个命令，队伍中所有成员同时阻击某人。
                   在使用到这个命令的时候，如果被阻击对象预先主动发起攻
                   击或试图杀害本队伍中的某一个成员的话，则队长发起这个
                   命令以后，所有的成员虽然试图杀死对方，但是不会被认为
                   是主动PK而招致张三李四的惩罚。这时候如果被阻击的对象
                   在本次战斗中（即没有停手过）打晕队伍中的其他人（非原
                   先主动攻击的玩家）也不会算是主动PK，也就是说你试图杀
                   队伍中某一个人而遭到对方的全体反扑的时候，杀绝对方你
                   的PK记录也只增加一个。
                   另一种情况：如果队长主动发出命令攻击对方，则队伍中所
                   有的成员都被认为是主动发起了攻击，那么对方不论打晕谁
                   都不认为是PK，即对方将整个队伍全部干掉，也不会遭受惩
                   罚。当然，任何情况下只要杀人官府都会追究。

team swear <名字>- 全队结义。只有队长才能够使用这个命令，如果队伍中的人
                   意气相合，想结为兄弟同盟，则可以让全体人员结义。同时
                   这个团伙将会赋予队长指定的名字。注意：一个玩家只能加
                   入一个这样的同盟，但是这并不影响你和其他玩家进行私人
                   之间的结拜。

直接下 team 指令时则会显示你目前是否有加入队伍及队员名单。

注: team 跟 follow 是独立的，你不一定要 follow 队伍的领袖就可以跟随队长
一起行动。
HELP );
	return 1;
}
