import { _decorator, Component, Node, Prefab, instantiate, NodePool } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PoolManager')
export class PoolManager extends Component {
    public static instance: PoolManager = null!;

    // 存储不同类型的对象池，Key 是预制体的名字
    private _pools: Map<string, NodePool> = new Map();

    onLoad() {
        PoolManager.instance = this;
    }

    /**
     * 获取对象
     * @param prefab 预制体
     * @param parent 父节点
     */
    public getNode(prefab: Prefab, parent: Node): Node {
        let name = prefab.name;
        let pool: NodePool;

        if (this._pools.has(name)) {
            pool = this._pools.get(name)!;
        } else {
            pool = new NodePool();
            this._pools.set(name, pool);
        }

        // 如果池子里有，就取出一个；没有就实例化一个新的
        let node = pool.size() > 0 ? pool.get()! : instantiate(prefab);
        node.parent = parent;
        return node;
    }

    /**
     * 回收对象
     * @param node 需要回收的节点
     * @param prefabName 预制体名字（需与获取时一致）
     */
    public putNode(node: Node) {
        let name = node.name;
        if (this._pools.has(name)) {
            this._pools.get(name)!.put(node);
        } else {
            // 如果没有这个池子，直接销毁防止内存泄露
            node.destroy();
        }
    }
}